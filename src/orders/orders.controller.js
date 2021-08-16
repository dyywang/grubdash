const { networkInterfaces } = require("os");
const path = require("path");
const methodNotAllowed = require("../errors/methodNotAllowed");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

function validOrderId(req, res, next){
  const orderId = req.params.orderId
  const foundOrder = orders.find( (order) =>orderId === order.id)
  if (!foundOrder)
    next({status:404, message:`Invalid OrderId: ${orderId}`})
  res.locals.order = foundOrder
  next()
}

function validDeliverTo(req, res, next){
  const deliverTo = req.body.data.deliverTo
  if (!deliverTo)
    next({status:400, message:`Order must include a deliverTo`})
  res.locals.deliverTo = deliverTo
  next()
}

function validMobileNumber(req, res, next){
  const mobileNumber = req.body.data.mobileNumber
  if (!mobileNumber)
    next({status:400, message:`Order must include a mobileNumber`})
  res.locals.mobileNumber = mobileNumber
  next()
}

function validDishes(req, res, next){
  const dishes = req.body.data.dishes
  if (!dishes)
    next({status:400, message:`Order must include a dish`})
  if (!Array.isArray(dishes))
    next({status:400, message:`Order must include at least one dish - not array`})
  if (dishes.length===0)
    next({status:400, message:`Order must include at least one dish`})
  dishes.forEach( (dish, index)=>{
    if (!dish.quantity || ! Number.isInteger(dish.quantity) || dish.quantity <= 0 )
      next({status:400, message:`Dish ${index} must have a quantity that is an integer greater than 0`})
  })
  res.locals.dishes = dishes
  next()
}

function matchingId(req, res, next){
  const orderId = req.body.data.id
  const routeId = req.params.orderId
  if (!orderId)
    next()
  if (routeId !== orderId)
    next({status:400, message:`Order id does not match route id. Order: ${orderId}, Route:${routeId}.`})
  next()
}

function validStatus(req, res, next){
  const status = req.body.data.status
  if (!status || ! ['pending', 'preparing', 'out-for-delivery', 'delivered'].includes(status) )
    next({status:400, message:`Order must have a status of pending, preparing, out-for-delivery, delivered` })
  if (status === `delivered`)
    next({status:400, message: `A delivered order cannot be changed`})
  res.locals.status = status
  next()
}

function create(req, res, next){
  const status = req.body.data.status
  const order = {id:nextId(), deliverTo: res.locals.deliverTo, status:status, mobileNumber:res.locals.mobileNumber, dishes:res.locals.dishes }
  orders.push(order)
  res.status(201).json({data:order})
}

function read(req, res, next){
  res.json({data:res.locals.order})
}

function update(req, res, next){
  let order = res.locals.order
  order = {...order, deliverTo: res.locals.deliverTo, status:res.locals.status, mobileNumber:res.locals.mobileNumber, dishes:res.locals.dishes }
  res.status(200).json({data:order})
}

function list(req, res, next){
  res.json({data:orders})
}

function destroy(req, res, next){
  const thisOrder = res.locals.order
  if (thisOrder.status !== 'pending')
    next({status:400, message:'An order cannot be deleted unless it is pending'})
  const index = orders.findIndex( (order) => order === thisOrder)
  orders.splice(index, 1)
  res.sendStatus(204)
}

module.exports = {
  create:[validDeliverTo, validMobileNumber, validDishes, create],
  read:[validOrderId, read],
  update:[validOrderId, matchingId, validDeliverTo, validMobileNumber, validDishes, validStatus, update],
  delete:[validOrderId, destroy],
  list
}
// TODO: Implement the /orders handlers needed to make the tests pass
