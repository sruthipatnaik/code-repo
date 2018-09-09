var request = require('supertest');

var app = require('../app').app;

describe('Calculator unit tests', function(){
    it("happy case add", function(done){
        request(app)
            .get("/calculator/add?first=1.2&second=3.4")
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, {result : 4.6})
            .end(function (err) {
                if(err) {
                    return done(err);
                }
                return done();
            })
    });

    
});
