const express = require("express");
const mongoose = require("mongoose");
const ProductModel = require("./schema");

const productsRouter = express.Router();

productsRouter.get("/", async (req, res, next) => {
  try {
    const products = await ProductModel.find();
    res.send(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    res.send(product);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body);
    const { _id } = await newProduct.save();
    res.send(_id);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        runValidators: true,
        new: true,
      }
    );
    if (product) {
      res.send(product);
    } else {
      const error = new Error(
        `Product with this id ${req.params.id} not found`
      );
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (product) {
      res.send("Product Deleted");
    } else {
      const error = new Error(
        `Product with this id ${req.params.id} not found`
      );
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const { reviews } = await ProductModel.findById(req.params.id, {
      reviews: 1,
      _id: 0,
    });
    res.send(reviews);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.get("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await ProductModel.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );
    if (reviews && reviews.length > 0) {
      res.send(reviews[0]);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.post("/:id/reviews", async (req, res, next) => {
  try {
    const addReview = await ProductModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reviews: req.body,
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    res.send(addReview);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.put("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const { reviews } = await ProductModel.findOne(
      {
        _id: mongoose.Types.ObjectId(req.params.id),
      },
      {
        _id: 0,
        reviews: {
          $elemMatch: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
        },
      }
    );
    if (reviews && reviews.length > 0) {
      const replaceReview = { ...reviews[0].toObject(), ...req.body };

      const editedReview = await ProductModel.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.params.id),
          "reviews._id": mongoose.Types.ObjectId(req.params.reviewId),
        },
        {
          $set: { "reviews.$": replaceReview },
        },
        {
          runValidators: true,
          new: true,
        }
      );
      res.send(editedReview);
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

productsRouter.delete("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const deleteReview = await ProductModel.findByIdAndUpdate(req.params.id, {
      $pull: {
        reviews: { _id: mongoose.Types.ObjectId(req.params.reviewId) },
      },
    });
    res.send(deleteReview);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = productsRouter;
