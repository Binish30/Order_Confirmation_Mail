const express = require("express")
const Order = require("../models/order")
const Cart = require("../models/cart")
const User = require("../models/user")
const Auth = require("../middleware/auth")
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51K5oDhFyMddIu9oDIxWr4FhcaSElSU6IYZXfS04HH4YWz80STi6uJxe7lKrcThMKO3ZKysEVXbcSnuqJpkqRe4QW00ldfUU1v5');

const router = new express.Router()

//get orders

router.get('/orders', Auth, async (req, res) => {
    const owner = req.user._id;
    try {
        const order = await Order.find({ owner: owner }).sort({ date: -1 });
        res.status(200).send(order)
    } catch (error) {
        res.status(500).send()
    }
});

//checkout
router.get('/checkout', Auth, async (req, res) => {
    const owner = req.user._id;

    try {
        const cart = await Cart.findOne({ owner });
        console.log('checkout', req.user);

        if (cart && cart.items.length > 0) {
            const newOrder = await Order.create({
                owner,
                items: [...cart.items],
                bill: cart.bill,
            });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    // user: process.env.EMAIL_USER,
                     user: '', //enter email_id
                    // pass: process.env.EMAIL_PWD
                     pass: '' //enter password
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: 'Order Confirmation',
                text: 'The order has been placed successfully.'
            };
            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent :' + info.response);
              }
            });

            await Cart.deleteOne(_id = cart._id);
            res.status(201).send(newOrder);
        } else {
            res.send('Cart is empty.');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router
