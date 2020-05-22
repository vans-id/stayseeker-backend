const Item = require('../models/Item');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Member = require('../models/Member');

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select(
          '_id title city country price unit imageId'
        )
        .limit(5)
        .populate({
          path: 'imageId',
          select: '_id imageUrl',
        });

      const travelers = await Booking.find();
      const treasures = await Activity.find();
      const cities = await Item.find();
      const categories = await Category.find()
        .select('_id name')
        .limit(3)
        .populate({
          path: 'itemId',
          select:
            '_id title city country isPopular imageId',
          populate: {
            path: 'imageId',
            select: '_id imageUrl',
            perDocumentLimit: 1,
          },
          perDocumentLimit: 4,
          option: { sort: { sumBooking: -1 } },
        });

      for (let i = 0; i < categories.length; i++) {
        for (
          let j = 0;
          j < categories[i].itemId.length;
          j++
        ) {
          const checkedItem = await Item.findById(
            categories[i].itemId[j]._id
          );

          checkedItem.isPopular = false;
          await checkedItem.save();

          if (
            categories[i].itemId[0] ===
            categories[i].itemId[j]
          ) {
            checkedItem.isPopular = true;
            await checkedItem.save();
          }
        }
      }

      const testimonial = {
        _id: 'asd1293uasdads1',
        imageUrl: '/images/testimonial1.jpg',
        name: 'Happy Family',
        rate: 4.55,
        content:
          "Stayseeker has really helped our family trip. I love their system. I don't always clop, but when I do, it's because of Stayseeker.",
        familyName: 'John Smith',
        familyOccupation: 'Businessman',
      };

      res.status(200).json({
        hero: {
          travelers: travelers.length,
          treasures: treasures.length,
          cities: cities.length,
        },
        mostPicked,
        categories,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const selectedItem = await Item.findById(id)
        .populate({
          path: 'imageId',
          select: '_id imageUrl',
        })
        .populate({
          path: 'featureId',
          select: '_id name qty imageUrl',
        })
        .populate({
          path: 'activityId',
          select: '_id name type imageUrl',
        });

      const bank = await Bank.find();

      const testimonial = {
        _id: 'asd1293uasdads2',
        imageUrl: '/images/testimonial2.jpg',
        name: 'Happy Family',
        rate: 4.55,
        content:
          "Great job, I will definitely be ordering again! Stayseeker is worth much more than I paid. It's incredible. I would also like to say thank you to all your staff.",
        familyName: 'Jill Valentine',
        familyOccupation: 'Accountant',
      };

      res.status(200).json({
        ...selectedItem._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  bookingPage: async (req, res) => {
    try {
      const {
        idItem,
        duration,
        bookingStartDate,
        bookingEndDate,
        firstName,
        lastName,
        email,
        phoneNumber,
        accountHolder,
        bankFrom,
      } = req.body;

      if (!req.file) {
        return res
          .status(404)
          .json({ message: 'Image is required' });
      }

      if (
        !idItem ||
        !duration ||
        !bookingStartDate ||
        !bookingEndDate ||
        !firstName ||
        !lastName ||
        !email ||
        !phoneNumber ||
        !accountHolder ||
        !bankFrom
      ) {
        res.status(404).json({
          message: 'Please fill all blank fields',
        });
      }

      const bookedItem = await Item.findById(idItem);

      if (!bookedItem) {
        res
          .status(404)
          .json({ message: 'Item not found' });
      }
      bookedItem.sumBooking += 1;
      await bookedItem.save();

      let total = bookedItem.price * duration;
      let tax = total * 0.1;

      const invoice = Math.floor(
        1000000 + Math.random() * 9000000
      );

      const newMember = await Member.create({
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      const newBooking = {
        invoice,
        bookingStartDate,
        bookingEndDate,
        total: total + tax,
        itemId: {
          _id: bookedItem.id,
          title: bookedItem.title,
          price: bookedItem.price,
          duration,
        },
        memberId: newMember.id,
        payments: {
          proofPayment: `images/${req.file.filename}`,
          bankFrom,
          accountHolder,
        },
      };

      const createdBooking = await Booking.create(
        newBooking
      );

      res.status(201).json({
        message: 'Successfully book',
        createdBooking,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
