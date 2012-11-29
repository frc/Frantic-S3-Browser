HTML5-file-browser-and-uploader-for-Amazon-S3
=============================================

File browser and uploader for Amazon S3. Fully HTML5 based, no server needed.

Setup
=========
*Add the bucket
Add a new bucket using https://console.aws.amazon.com/s3/home - pay attention
that you place the bucket in the region you want it to be in.

*Add Bucket Policy for Website Access
Select the bucket, press "Properties". In the Permissions tab press
"Add Bucket Policy". Paste this in, replacing "YOURBUCKETNAME" with the name
of your bucket:

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

Save the policy.

*Enable Website Access
Select the "Website Access" tab in Properties. Check Enabled [X] and specify
"index.html" as the Index Document. Note the endpoint Amazon gives to you and
write it down. Press save.

*Add a CORS policy to enable API requests
Go back to Permissions tab and press "Add a CORS policy". Paste this in:

<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
    <CORSRule>
        <AllowedOrigin>*</AllowedOrigin>
        <AllowedMethod>POST</AllowedMethod>
        <AllowedMethod>GET</AllowedMethod>
        <AllowedHeader>*</AllowedHeader>
    </CORSRule>
</CORSConfiguration>

*Add the user to access the bucket. Go to IAM, add a new user.
Save the Security Credentials, you will need them later in the setup.
Select the user's Permissions tab and add a Policy as follows:

TODO: Not all s3: actions are needed, just bucketlist, putobject?

{
  "Statement": [
    {
      "Sid": "Stmt1353931095381",
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


*Setting up Siirrin
Rename the "rename-me" folder to something hard to guess. The folder name
works as a password. If someone guesses the folder names and can guess
the file names in your folder they will be able to access the files
anonymously through the Website Access.

*Configure the index.html file in the renamed "rename-me" folder.
Put in the bucket name and the Access Id of the user.
Put in the renamed folder name.
TODO better documentation here.

*Upload the renamed "rename-me" folder to your bucket.

*Access the bucket as
....?aws_secret_access_key=...


Thank you
=========

Raymond Yee for publishing snippet
http://blog.mashupguide.net/2008/11/25/amazon-s3-signature-calculation-in-javascript/


Copyright
=========

sha1.js
 Version 2.2 Copyright Paul Johnston 2000 - 2009.
 Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 Distributed under the BSD License
 See http://pajhome.org.uk/crypt/md5 for details.

 - from http://pajhome.org.uk/crypt/md5/sha1.html

sha1-alternative.js
 Version 2.1a Copyright Paul Johnston 2000 - 2002.
 Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 Distributed under the BSD License
 See http://pajhome.org.uk/crypt/md5 for details.

 - from http://pajhome.org.uk/crypt/md5/sha1.js
