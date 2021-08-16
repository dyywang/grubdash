const { response } = require("express");
const { networkInterfaces } = require("os");
const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function foundId (req, res, next){
  const dishId = req.params.dishId
  const dish = dishes.find( (dish) => dish.id === dishId )
  if (!dish)
    next({status:404, message:`${dishId} not found`})
  res.locals.dish = dish
  next()
}

function matchingId (req, res, next){
  const dishId = res.locals.dish.id
  const id = req.body.data.id
  if (id && dishId !== id)
    next({status:400, message : `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`})
  else 
    next()
}

function validName(req, res, next) {
  console.log(req.body)
  //const name = {data: { name } = {} } = req.body
  const name = req.body.data.name

  if (!name)
    next({status:400, message:`Dish must include a name`})
  else {
    res.locals.name = name
    next()
  }
}

function validDescription(req, res, next) {
  //const description = {data: {description} } = req.body
  const description = req.body.data.description
  if (!description)
    next({status:400, message:`Dish must include a description`})
  else {
    res.locals.description = description
    next()
  }
}

function validPrice(req, res, next) {
  //const price = {data: {price} } = req.body
  const price = req.body.data.price
  if (price===undefined)
    next({status:400, message:`Dish must include a price`})
  if (! Number.isInteger(price) || Number(price)<=0)
    next({status:400, message:`Dish must have a price that is an integer greater than 0`})
  res.locals.price = Number(price)
  next()
}

function validUrl(req, res, next) {
  //const url = {data: {url} } = req.body
  const url = req.body.data.image_url
  if (!url)
    next({status:400, message:`Dish must include a image_url`})
  else {
    res.locals.url = url
    next()
  }
}

function create(req, res, next){
  const newDish = {id:nextId(), name:res.locals.name, description:res.locals.description, price:res.locals.price, image_url:res.locals.url}
  dishes.push(newDish)
  res.status(201).json({data:newDish})
}

function list(req, res, next){
  res.json({data:dishes})
}

function read(req, res, next){  
  res.json({data:res.locals.dish})
}

function update(req, res, next){
  let dish = res.locals.dish
  dish = {...dish, name:res.locals.name, description:res.locals.description, price:res.locals.price, image_url:res.locals.url }
  res.status(200).json({data:dish})
}


module.exports = {
  list,
  read:[foundId, read],
  create:[validName, validDescription, validPrice, validUrl, create],
  update:[foundId, matchingId, validName, validDescription, validPrice, validUrl, update]
}
