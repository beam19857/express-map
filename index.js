var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var imgModel = require("./model/models");
var fs = require("fs");
var path = require("path");
const { v4: uuidv4 } = require('uuid')
require("dotenv/config");
const { Storage } = require("@google-cloud/storage");
const fileUpload = require("express-fileupload");


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Option, Authorization')
    return next()
})
mongoose.connect(
  process.env.MONGO_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("connected");
  }
);

app.use( // => Use Express File Upload
  fileUpload({
    createParentPath: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set EJS as templating engine
app.set("view engine", "ejs");

const createImage = (data) => {
    console.log("========");
    console.log(data);
  return new Promise((resolve, reject) => {
    imgModel.create(data, (err, data) => {
      if (err) {
        reject(new Error("Can not create image"));
      } else {
        resolve({ message: "create image success!!" });
      }
    });
  });
};

const getImage = () => {
  return new Promise((resolve, reject) => {
    imgModel.find({}, (err, data) => {
      if (data) {
        resolve(data);
      } else {
        reject(new Error("Can not get image"));
      }
    });
  });
};

app.post("/create", (req, res, next) => {
    console.log(req.body);
    console.log("============");
    console.log(req.files);
  const storageCloud = new Storage({
    projectId: "sixth-storm-353714",
    credentials: {
      client_email: "projectbucketmap@sixth-storm-353714.iam.gserviceaccount.com" ,
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCeKt2/NZNwetw6\nkHLaV4wLwujJboOzdHUE+q/v5RWqzFCzqAH+Of331h84KQVtyTs6o4sXDEGhQWot\nXJDRmoGJIqnXATMQGQtxFoJx+pg9P7Y0Zu7GIUZEmU9SYQM102nVNnzHfeWc0Bxg\nsymlNIRE3Ap11KITYuov2VRB2GumQFeroy14FRorm4JSPsu3RPVKX3e3HM40o+xd\nblCZJDK0pSE1Ci0JpFUlQMd8PJ7LbTXUryj9u0flkpQDAqhLcLvf6ZwU4iS1yh8e\n3nDC+856AErutiGh6/xa111fXxFnYCWyMaiJnW3/DxMGeOQhbPHuXAcCMNdvbDQf\nGl3XsQhrAgMBAAECggEAR4Jd6xsP4+TIOPoh0zGNsauXj6qVhMb8ORoV/UH3f9cM\nDY3CCOyzNB/s0XlKaQ535tUWB3+VFJD8rjGRkBJoylWPsBNswLRyBdkFdP61Ycuy\nVxLKlW1p1Y3y3O3bg7Rnvuv5kkALVdCJY/bct0J9IpzRZeCSvm0UMDnz7Ckq0mjC\ne1iWM9LmhI5VYTN7GY0sXBDYpwu3EYECyKENKJvczugbAYyKAlICT1mSAJJl0fdZ\n/MHstd1IGUhOf7ULO8YTMa2HEnJyvmlytPM5scXJFR2zfo098Ai5wn+4zSRxSzjl\nS7MJz4c94ECVi19G8udV25rWhFwUn+ankMudnkRp0QKBgQDU+EYrook6JTOcJXLl\nWBashfLUJk8K2BgAZCCxo7yyz+JZ0Z44NC+oOYTEsIzVZQYO6FriDqzs3Di9pl1L\nAfW8Dal6b0yK+6+SJOVj+vObkyNXVdNQWgZlqNguohyOLfaYbiXE+JgzZPKs4why\nApJVzk8NTBnM4Q8tSyhTn1CbHwKBgQC+H/mMcvSoIS6ibMsaODH7np+BIMIq21y6\nayTTQAtMuLTwQg7xcIY+WmC+pJipuRgHP5V+3su+C3kL6W2lcLqUnqErEIQNHSrE\nSR1mqYU6W+ABOpELmztDe4kQY3abfOw7/mxdvzeseuq9FzcgP1H41yQp8jOCgzT1\nnztfKyy1NQKBgCRNKZDYhLGfk7uC+qGzMTI5JtoYqZJ8oSK37oa5FToZi0iqHWER\nLCptm373ZRoevTifTJaJz9oT86wIBpD5hYyHe6L+A7sRCa1MkrlHFm0nWHfTjlB8\n9+guLqNMSLfHh+gVpmR7x13DUEY98LuWSqFLqFfo5+DvX+nljLssRc4bAoGAZtL8\nL81sLBHmGsoj/gYuYhsjwL5qxKrmt5uCyw10DwZGNTpEwqdMsyRF9lUmi4QjTqhA\nveDY5+tkh+CzACq7fe1c1OGVyVHg809nq0I7X5iYyZFXKKPHpXOGaWqhlu41BS1Q\nhlMIVSwVEDciBTq5po8Ua+slmIxFdCGuBoZfI5ECgYB9y2nm1JtFFh1BlZDnh+rL\nuSnmrMILdthuaN0neWPUxbeuzyJ0mkiCgNqx8FHL+uomsqxKSpGvuN0wWpZE8O0t\n28BQjfqEJ2SRvGro9JYZpOON8AIxYvRVGc+2s3iYqrQGZkQM6tSlZiJP3U6XxTx5\nq8OtT6BUWbkRK9SeA+8Nxw==\n-----END PRIVATE KEY-----\n",
    },
  });
  const bucket = storageCloud.bucket("projectbucketmap");
  try {
    // When Don't Have file
    if (!req.files) {
      if (Creating) {
        http.response(res, 201, true, "Created successful");
      } else {
        http.response(res, 400, false, "Bad request, unable to created data");
      }
    } else {
      // When Have File
      // Set File name and contents data 
    
    const fileName = uuidv4() + "-" + req.files.image.name
    const contents = req.files.image.data
    const file = bucket.file(`${fileName}`)
    file.save(contents)
    const image = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        image: fileName
        };
        console.log("===========");
        console.log(image);
    createImage(image)
        .then((result) => {
          res.status(200).json(result);
        })
        .catch((err) => {
          res.status(404).send(err);
        });
    } // Finish Save Image and Data
  } catch (e) {
    console.log(e);
  }
});
 

app.get("/getimage", (req, res) => {
  getImage()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(404);
    });
});
var port = process.env.PORT || "8080";
app.listen(port, (err) => {
  if (err) throw err;
  console.log("Server listening on port", port);
});
