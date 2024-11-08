/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const client = require("../database");
const { ObjectId } = require("mongodb");

module.exports = function (app) {

  app.route('/api/books')
    .get(async (req, res) => {
      const books = client.db('project-library').collection('book');
      const result = (await books.find().toArray()).map(b => { 
        return { 
          _id: b._id,
          title: b.title,
          commentcount: b.comments.length
        }
      });
      res.json(result);
    })
    
    .post(async (req, res) => {
      let title = req.body.title;
      if (!title) return res.json('missing required field title');

      const books = client.db('project-library').collection('book');
      const book = await books.insertOne({ title, comments: [] });
      res.status(200).json({ _id: book.insertedId, title });
    })
    
    .delete(async(req, res) => {
      const books = client.db('project-library').collection('book');
      await books.deleteMany();
      res.json('complete delete successful');
    });



  app.route('/api/books/:id')
    .get(async (req, res) => {
      let bookid = req.params.id;
      const books = client.db('project-library').collection('book');
      const result = await books.findOne({ _id: ObjectId.createFromHexString(bookid) });
      if (!result) res.json('no book exists');
      else res.json(result);
    })
    
    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;
      if (!comment) {
        res.json('missing required field comment');
        return;
      }

      const books = client.db('project-library').collection('book');
      const filter = { _id : ObjectId.createFromHexString(bookid) };
      const updatedBook = await books.updateOne(filter, { $push: { comments: comment } });

      if (updatedBook.modifiedCount < 1) {
        res.json('no book exists');
        return;
      } 
      
      const result = await books.findOne(filter);
      res.json(result);
    })
    
    .delete(async (req, res) => {
      let bookid = req.params.id;
      const filter = { _id : ObjectId.createFromHexString(bookid) };
      const books = client.db('project-library').collection('book');
      const result = await books.findOneAndDelete(filter);
      if (!result) {
        res.json('no book exists');
      } else {
        res.json('delete successful');
      }
    });
  
};
