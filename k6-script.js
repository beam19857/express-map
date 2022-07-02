import { check } from "k6";
import http from 'k6/http';
const binFile = open('./image.png', 'b');

export default function() {
  var url = 'http://localhost:3000';
  var formdata = {
    latitude: '1234',
    longitude: '4321',
    image:'somedata@gmail.com'
  };

  var params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    redirects: 1
  };

  let res = http.post(url, formdata, params);

  check(res, {
    "is status 200": r => r.status === 200
 });

}