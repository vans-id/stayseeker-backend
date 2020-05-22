const fs = require('fs');
const chai = require('chai');
const http = require('chai-http');
const expect = chai.expect;
const app = require('../app');

chai.use(http);

describe('API ENDPOINT TESTING', () => {
  it('GET Landing Page', (done) => {
    chai
      .request(app)
      .get('/api/v1/member/landing-page')
      .then((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('Object');

        expect(res.body).to.have.property('Hero');
        expect(res.body.hero).to.have.all.keys(
          'travelers',
          'treasures',
          'cities'
        );

        expect(res.body).to.have.property(
          'mostPicked'
        );
        expect(res.body.mostPicked).to.have.an(
          'array'
        );

        expect(res.body).to.have.property(
          'categories'
        );
        expect(res.body.categories).to.have.an(
          'array'
        );

        expect(res.body).to.have.property(
          'testimonial'
        );
        expect(res.body.testimonial).to.have.an(
          'Object'
        );
        done();
      })
      .catch(done());
  });

  it('GET Detail Page', (done) => {
    chai
      .request(app)
      .get(
        '/api/v1/member/detail-page/5e96cbe292b97300fc902223'
      )
      .then((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('Object');
        expect(res.body).to.have.property('country');
        expect(res.body).to.have.property('isPopular');
        expect(res.body).to.have.property('unit');
        expect(res.body).to.have.property(
          'sumBooking'
        );

        expect(res.body).to.have.property('imageId');
        expect(res.body.imageId).to.have.an('array');

        expect(res.body).to.have.property('featureId');
        expect(res.body.featureId).to.have.an('array');

        expect(res.body).to.have.property(
          'activityId'
        );
        expect(res.body.activityId).to.have.an(
          'array'
        );

        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('title');
        expect(res.body).to.have.property('price');
        expect(res.body).to.have.property('city');
        expect(res.body).to.have.property(
          'description'
        );

        expect(res.body).to.have.property('bank');
        expect(res.body.bank).to.have.an('array');

        expect(res.body).to.have.property(
          'testimonial'
        );
        expect(res.body.testimonial).to.have.an(
          'Object'
        );

        done();
      })
      .catch(done());
  });

  it('POST Booking Page', (done) => {
    const image = __dirname + '/buktibayar.jpeg';
    const dataSample = {
      image,
      idItem: '5e96cbe292b97300fc902223',
      duration: 2,
      bookingStartDate: '9-4-2020',
      bookingEndDate: '11-4-2020',
      firstName: 'Adar',
      lastName: 'Kirenas',
      email: 'adar@adar.com',
      phoneNumber: '08123456789',
      accountHolder: 'Adar',
      bankFrom: 'BRI',
    };

    chai
      .request(app)
      .post('/api/v1/member/booking-page')
      .set('Content-Type', 'application/json')
      .send({
        ...dataSample,
        image: fs.readFileSync(dataSample.image),
      })
      .then((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(201);
        expect(res.body).to.be.an('Object');

        expect(res.body).to.have.property('message');
        expect(res.body.message).to.equal(
          'Successfully book'
        );

        expect(res.body).to.have.property('booking');
        expect(res.body.booking).to.have.all.keys(
          '_id',
          'invoice',
          'bookingStartDate',
          'bookingEndDate',
          'total',
          'itemId',
          'memberId',
          'payments'
        );
        expect(
          res.body.booking.payments
        ).to.have.all.keys(
          'status',
          'proofPayment',
          'bankFrom',
          'accountHolder'
        );
        expect(
          res.body.booking.itemId
        ).to.have.all.keys(
          '_id',
          'title',
          'price',
          'duration'
        );

        done();
      })
      .catch(done());
  });
});
