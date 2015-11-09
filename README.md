Frantic-S3-Browser
==================

Frantic-S3-Browser is a file browser and uploader for Amazon S3. Fully HTML5 based,
no server needed.

You can serve Frantic-S3-Browser from a single bucket and then create a bucket for each
customer/project you want to serve. Frantic-S3-Browser is simply a browser-based client
to S3 enabling you and your users to download and upload files in buckets.

Setup: The website bucket for Frantic-S3-Browser
================================================
( If you want to quickly try out Frantic-S3-Browser you can skip this step and just use
http://frc.github.com/Frantic-S3-Browser/ and create your bucket in the EU (Ireland) Region )

 - Add a new bucket using https://console.aws.amazon.com/s3/home - pay attention
   that you place the bucket in the region you want it to be in. This bucket
   is used to serve the login website to your users. You can customize it to match
   your brand.

 - Add Bucket Policy for Website Access
   Select the bucket, press "Properties". In the Permissions tab press
   "Add Bucket Policy". Paste this in, replacing "YOURBUCKETNAME" with the name
   of your bucket, and save the policy:

   {
    "Version": "2008-10-17",
    "Statement": [
             {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::YOURBUCKETNAME/*"
             }
    ]
   }

 - Enable Website Access
   Select the "Website Access" tab in Properties. Check Enabled [X], specify
   "index.html" as the Index Document and "error.html" as the Error Document.
   Note the endpoint Amazon gives to you and write it down. Press Save.

 - Customize the s3_endpoint at the end of the index.html file. It is set to EU (Ireland) Region
   endpoint by default. See http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region
   for a listing of proper endpoints.

 - Upload all files of Frantic-S3-Browser to the root of the website bucket you just created.

Setup: The bucket for a single customer's/project's data
========================================================
 - Add the bucket
   Add a new bucket using https://console.aws.amazon.com/s3/home - pay attention
   that you place the bucket in the region you want it to be in.

 - If you want the connection to be secure (HTTPS) do not use dots in the bucket name.
   Using dots in the bucket name will drop the connection to insecure HTTP.

 - Add a CORS policy to enable API requests
   Go back to Permissions tab and press "Add a CORS policy". Paste this in:

```
   &lt;?xml version="1.0" encoding="UTF-8"?&gt;
   &lt;CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"&gt;
       &lt;CORSRule&gt;
           &lt;AllowedOrigin&gt;*&lt;/AllowedOrigin&gt;
           &lt;AllowedMethod&gt;POST&lt;/AllowedMethod&gt;
           &lt;AllowedMethod&gt;GET&lt;/AllowedMethod&gt;
           &lt;AllowedHeader&gt;*&lt;/AllowedHeader&gt;
       &lt;/CORSRule&gt;
   &lt;/CORSConfiguration&gt;
```

 - Add the user to access the bucket. Go to IAM, add a new user.
   Save the Security Credentials, you will need them later in the setup.
   Select the user's Permissions tab and add a Policy as follows.

```
   {
    "Statement": [
    {
      "Sid": "Stmnt1",
      "Action": [
        "s3:*"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::YOURBUCKETNAME","arn:aws:s3:::YOURBUCKETNAME/*"
      ]
    }
    ]
   }
```

 - Repeat this procedure for each customer/project bucket you need.

Setup: Customizing Frantic-S3-Browser look and feel
===================================================
Edit css/branding.css.


Thank you
=========
Raymond Yee for publishing snippet
http://blog.mashupguide.net/2008/11/25/amazon-s3-signature-calculation-in-javascript/


Copyright
=========
Copyright (c) 2012-2013, Oskari Ojala, Lauri Kallioniemi, Miika Puputti, Frantic Oy
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

sha1.js
 Version 2.2 Copyright Paul Johnston 2000 - 2009.
 Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 Distributed under the BSD License
 See http://pajhome.org.uk/crypt/md5 for details.
