const express = require("express");
const userAuth = require("../Middleware/userAuth.js")
const moment = require ("moment");
const BookingModel = require ('../Model/Booking.js')
const BookingRouter = express.Router();


BookingRouter.get("/availableSlots", async(req,res)=>{
    const { date } = req.query;
    const bookingDate = moment(new Date(date)).add(1, "days");
  
    let slots = ["MorningSlot", "AfternoonSlot", "EveningSlot"];
    try {
     
      if (bookingDate > moment(new Date()).add(1, "days")) {
        const bookings = await BookingModel.find({ bookingDate });
       
  
      
        let arr = [];
        for (let slot of slots) {
          let count = 0;
          for (let booking of bookings) {
            if (slot === booking.slot) {
              count++;
              break;
            }
          }
          if (count === 0) {
            arr.push(slot);
          }
        }
        res.status(200).json({ message: "available slots", data: arr });
      } else {
        res.status(406).json({ message: "Please enter valid date" });
      }
    } catch (e) {
      res.status(500).send("Error: " + e.message);
    }
      
});
BookingRouter.post("/bookSlot",userAuth, async (req,res)=>{
    const { date, name, reqSlot } = req.body;
  const bookingDate = moment(new Date(date)).add(1, "days");

  try {
    const bookings = await BookingModel.find({ bookingDate });

    const isBooked = bookings.some((booking) => booking.slot === reqSlot);
    if (!isBooked) {
      const newBooking = new BookingModel({
        bookingDate,
        name,
        slot: reqSlot,
        customer: req.user._id,
      });
      await newBooking.save();
      res.status(201).send(newBooking);
    } else {
      res.status(406).send(`${reqSlot} is already booked `);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error: " + err.message);
  }
});
BookingRouter.patch("/bookSlot/:id", userAuth, async(req,res)=>{
    const { date, name, reqSlot } = req.body;
    const { id } = req.params;
    const bookingDate = moment(new Date(date)).add(1, "days");
  
    try {
      const bookings = await venueBookingModel.find({ bookingDate });
  
      const isBooked = bookings.some((booking) => booking.slot === reqSlot);
      if (!isBooked) {
        const updateBooking = await BookingModel.findByIdAndUpdate(
          id,
          {
            bookingDate,
            name,
            slot: reqSlot,
          },
          { new: true, runValidators: true }
        );
        res.status(201).send(updateBooking);
      } else {
        res.status(406).send(`${reqSlot} is already booked `);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Error: " + err.message);
    }
  
});
BookingRouter.delete("/bookSlot/:id", userAuth, async(req,res)=>{
    const { id } = req.params;
    try {
      const data = await BookingModel.findByIdAndDelete(id);
      if (data) res.status(200).send(`Slot deleted with id:${id}`);
      else {
        res.status(404).send(`Slot with id:${id} does not exist`);
      }
    } catch (err) {
      res.status(500).send("Error: " + err.message);
    }
});

module.exports = BookingRouter;