/*jslint devel: true, browser: true, unparam: true, vars: true, white: true, passfail: false, nomen: true, maxerr: 50, indent: 4 */

var Siirrin = function () {
    "use strict";
    var bucket_name; // comes in init
    var secret_dir; // comes in init
    var uploader_container_id; // comes in init
    var aws_access_key_id; // comes in init
    var aws_secret_access_key; // comes in init
    var aws_signature; // comes inside init

    var protocolurl = window.location.protocol + '//';
    var s3url = '.s3.amazonaws.com/';
    var aws_canned_acl = 'public-read';
    var aws_policy_document;
    var aws_policy_document_b64;

    var set_aws_signature = function (as) {
            aws_signature = as;
    };

    var set_aws_access_key_id = function (aaki) {
        aws_access_key_id = aaki;
    };

    var set_aws_secret_access_key = function (asak) {
        aws_secret_access_key = asak;
    };

    var make_aws_policy_document = function () {
        aws_policy_document = '{"expiration": "2020-12-01T12:00:00.000Z", "conditions": [{"acl": "' + aws_canned_acl + '"}, {"bucket": "' + bucket_name + '"}, ["starts-with", "$key", "' + secret_dir + '/files/"]]}';
        aws_policy_document_b64 = rstr2b64(aws_policy_document);
    };

    var sign_api = function (expires) {
        var http_verb = 'GET';
        var canonicalized_resource = '/' + bucket_name + '/';
        var string_to_sign = http_verb + "\n" + '' + "\n" + '' + "\n" + expires + "\n" + '' + canonicalized_resource;
        // b64pad = "="; // needed for "strict RFC compliance"
        var sig = b64_hmac_sha1(aws_secret_access_key, string_to_sign);
        return sig + '=';
    };

    var location_querystring = function (location_search) {
            var result = {};
            var querystring = location.search;
            if (!querystring)
                return result;
            var pairs = querystring.substring(1).split("&");
            var splitPair;
            for (var i = 0; i < pairs.length; i++) {
                splitPair = pairs[i].split("=");
                result[decodeURIComponent(splitPair[0])] = decodeURIComponent(splitPair[1]);
            }
            return result;
    };

    var sign = function(aws_secret_access_key, string_to_sign) {
        var sig = b64_hmac_sha1(aws_secret_access_key, string_to_sign);
        return sig + '=';
        // Authorization: AWS AWSAccessKeyId:Signature
        // http://docs.amazonwebservices.com/AmazonS3/2006-03-01/dev/RESTAuthentication.html
    };

    var generate_bucket_listing = function (bucketlist_div_selector,files) {
        var out = '<ul class="root">';
        for (var i = 0; i < files.length; i++) {
            var name = files[i];

            // Skip files that end with a ~
            // Skip files that end with $folder$ (3hub files),
            // Skip files that have /siirrin/ in path
            if (/\$folder\$$/.exec(name) || /~$/.exec(name) || /\/siirrin\//.exec(name)) {
                continue;
            }

            var klass = 'file';
            var title = '/' + name;
            // Todo: Remove /rename-me/files/ from the beginning of the listing?

            var url   = '/' + name;
            out += '<li class="' + klass + '"><a href="' + url + '">' + title + '</a>' + '</li>';
        }
        out += "</ul>";
        $(bucketlist_div_selector).html(out);
    };

    var init_bucketlist = function (bucketlist_div_selector) {
        var expires = new Date().valueOf();
        expires = parseInt(expires/1000); // milliseconds to seconds
        expires += 21600; // signed request valid for 6 hours
        var signature = sign_api(expires);
        $(function() {
                $.ajax({
                        url: protocolurl + bucket_name + s3url,
                        data: {'AWSAccessKeyId': aws_access_key_id, 'Signature': signature, 'Expires': expires},
                        dataFormat: 'xml',
                        success: function(data) {
                            var contents = $(data).find('Contents');
                            var files = [];
                            for (var i = 0; i < contents.length; i++) {
                                files.push($(contents[i]).find('Key').text());
                            }
                            files.sort();
                            generate_bucket_listing(bucketlist_div_selector,files);
                        }
                    });
            });
    };

    var init_fileupload_field = function (fileupload_field_selector) {
        $(fileupload_field_selector).fileupload({
                url: protocolurl + bucket_name + s3url,
                type: 'POST',
                autoUpload: true,
                formData: {
                    key: secret_dir + '/files/${filename}',
                    AWSAccessKeyId: aws_access_key_id,
                    acl: aws_canned_acl,
                    policy: aws_policy_document_b64,
                    signature: aws_signature,
                }
            });
    };
    
    var login_form_beforeSubmit = function (formData, jqForm, options) {
        var formElement = jqForm[0];
        set_aws_access_key_id(formElement.aws_access_key_id);
        set_aws_secret_access_key(formElement.aws_secret_access_key);
        set_aws_signature(sign(aws_secret_access_key, aws_policy_document_b64));
        return false;
    };

    var init_login_form = function (form_selector) {
        jQuery(form_selector).ajaxform({beforeSubmit: login_form_beforeSubmit});
    };

    return {
        set_aws_access_key_id: function (args) {
            set_aws_access_key_id(args);
        },
        set_bucket_name: function (bn) {
            bucket_name = bn;
        },
        set_secret_dir: function (sd) {
            secret_dir = sd;
        },
	init_login_form: function (args) {
            init_login_form(args);
	},
        init: function (args) {
            make_aws_policy_document();

            var qs = location_querystring(args.qs);
            if (qs.aws_secret_access_key) {
                set_aws_secret_access_key(qs.aws_secret_access_key);
                set_aws_signature(sign(qs.aws_secret_access_key, aws_policy_document_b64));
            }
            init_bucketlist(args.bucketlist_div);
            init_fileupload_field(args.fileupload_field);
        }
    };
};

//  Load page with your secret access key as the query string. you will get a signature. Do not share your secret access key or write it in the files.
