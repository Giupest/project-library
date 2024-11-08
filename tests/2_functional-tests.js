/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {

        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .send({ title: 'firstTitle' })
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.isDefined(res.body._id);
            assert.equal(res.body.title, 'firstTitle');
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .keepOpen()
          .post('/api/books')
          .send({})
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end((err, res) => {
            assert.isArray(res.body);
            res.body.forEach(b => {
              assert.equal(res.status, 200);
              assert.hasAllKeys(b, ['_id', 'title', 'commentcount']);
              assert.isDefined(b._id);
              assert.isNotEmpty(b._id);
              assert.isDefined(b.title);
              assert.isNotEmpty(b.title);
              assert.isAtLeast(b.commentcount, 0);
            });
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .keepOpen()
          .get('/api/books/572dba36cfcaf86a0af2e9bf')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end((err, res) => {
            const book = res.body[0];
            chai.request(server)
              .keepOpen()
              .get(`/api/books/${book._id}`)
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.body.title, book.title);
                assert.equal(res.body._id, book._id);
                assert.isArray(res.body.comments);
                done();
              });
          });
      });
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){

        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end((err, res) => {
            assert.equal(res.status, 200);
            const book = res.body[res.body.length - 1];
            const commentText = 'first comment';
            chai.request(server)
              .keepOpen()
              .post(`/api/books/${book._id}`)
              .send({ comment: commentText })
              .end((err, res) => { 
                assert.equal(res.status, 200);
                assert.equal(res.body.title, book.title);
                assert.equal(res.body._id, book._id);
                assert.isArray(res.body.comments);
                assert.isAtLeast(res.body.comments.length, 1);
                assert.isTrue(res.body.comments.some(c => c === commentText))
                done(); 
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end((err, res) => {
            const book = res.body[res.body.length - 1];
            chai.request(server)
              .keepOpen()
              .post(`/api/books/${book._id}`)
              .send({})
              .end((err, res) => { 
                assert.equal(res.status, 200);
                assert.equal(res.body, 'missing required field comment');
                done(); 
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .keepOpen()
          .post(`/api/books/572dbee34019f6eecf84119f`)
          .send({ comment: 'first comment' })
          .end((err, res) => { 
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done(); 
          });
        });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .keepOpen()
          .get('/api/books')
          .end((err, res) => {
            const book = res.body[res.body.length - 1];
            console.log('identificativo:', book._id);
            chai.request(server)
              .keepOpen()
              .delete(`/api/books/${book._id}`)
              .end((err, res) => { 
                assert.equal(res.status, 200);
                assert.equal(res.body, 'delete successful');
                done(); 
              });
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .keepOpen()
          .delete(`/api/books/572dbee34019f6eecf84119f`)
          .end((err, res) => { 
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done(); 
          });
      });

    });

  });

});
