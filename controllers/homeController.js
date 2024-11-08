const fs = require('fs');
const { request } = require('http');
const path = require('path');

const title = "NieKupZłoma"

exports.GetIndex = async(req, res) => {
    res.render('home/index', { title });
};

exports.GetToyota = async(req, res) => {
    res.render('home/toyota', { title:"Toyota" });
};

exports.GetFord = async(req, res) => {
    res.render('home/ford', { title:"Ford" });
};

exports.GetPorsche = async(req, res) => {
    res.render('home/porsche', { title:"Porsche" });
};

exports.GetLamborghini = async(req, res) => {
    res.render('home/lamborghini', { title:"Lamborghini" });
};