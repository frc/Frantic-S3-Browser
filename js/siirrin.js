/*jslint devel: true, browser: true, unparam: true, vars: true, white: true, passfail: false, nomen: true, maxerr: 50, indent: 4 */

// This is a global variable of sha1.js and needs to be set for proper b64 encoded string.
b64pad = "="; // needed for "strict RFC compliance"

var Siirrin = function () {
    "use strict";
    var bucket;
    var uploader_container_id;
    var aws_access_key_id;
    var aws_secret_access_key;
    var aws_signature;
    var $login_form;
    var $logout_form;
    var $div_logout_form;
    var $bucketlist;
    var $fileupload_field;
    var $div_upload_form;
    var qs;

    var protocolurl = window.location.protocol + '//';
    var s3url = '.s3.amazonaws.com';
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

    var set_bucket = function (bn) {
        bucket = bn;
    };

    var set_bucketlist = function (selector) {
        $bucketlist = jQuery(selector);
        // Todo: If not found, alert here.
    };

    var set_fileupload_field = function (selector) {
        $fileupload_field = jQuery(selector);
        // Todo: If not found, alert here.
    };

    var set_div_upload_form = function (selector) {
        $div_upload_form = jQuery(selector);
        // Todo: If not found, alert here.
    };

    var make_aws_policy_document = function () {
        aws_policy_document = '{"expiration": "2020-12-01T12:00:00.000Z", "conditions": [{"acl": "' + aws_canned_acl + '"}, {"bucket": "' + bucket + '"},["starts-with", "$key", ""],["starts-with", "$Content-Type", ""]]}';
        aws_policy_document_b64 = rstr2b64(aws_policy_document);
    };

    var sign_api = function (expires, resource) {
        var http_verb = 'GET';
        var canonicalized_resource = '/' + bucket + resource;
        var string_to_sign = http_verb + "\n" + '' + "\n" + '' + "\n" + expires + "\n" + '' + canonicalized_resource;
        var sig = b64_hmac_sha1(aws_secret_access_key, string_to_sign);
        return sig;
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
        return sig;
        // Authorization: AWS AWSAccessKeyId:Signature
        // http://docs.amazonwebservices.com/AmazonS3/2006-03-01/dev/RESTAuthentication.html
    };

    var generate_bucket_listing = function (files) {
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
            var title = name;
            var url = protocolurl + bucket + s3url + '/' + name;

            var expires = new Date().valueOf();
            expires = parseInt(expires/1000); // milliseconds to seconds
            expires += 21600; // signed request valid for 6 hours
            var signature = sign_api(expires, '/' + name);
            var paramsdata = {'AWSAccessKeyId': aws_access_key_id, 'Signature': signature, 'Expires': expires};
            url += '?' + jQuery.param(paramsdata);

            out += '<li class="' + klass + '"><a href="' + url + '">' + title + '</a>' + '</li>';
        }
        out += "</ul>";
        $bucketlist.html(out);
    };

    var init_bucketlist = function () {
        var expires = new Date().valueOf();
        expires = parseInt(expires/1000); // milliseconds to seconds
        expires += 21600; // signed request valid for 6 hours
        var signature = sign_api(expires, '/');
        $(function() {
                $.ajax({
                        url: protocolurl + bucket + s3url + '/',
                        data: {'AWSAccessKeyId': aws_access_key_id, 'Signature': signature, 'Expires': expires},
                        dataFormat: 'xml',
                        cache: false,
                        success: function(data) {
                            $login_form.hide();
                            $div_logout_form.show();
                            $bucketlist.show();
                            $div_upload_form.show();
                            var contents = $(data).find('Contents');
                            var files = [];
                            for (var i = 0; i < contents.length; i++) {
                                files.push($(contents[i]).find('Key').text());
                            }
                            files.sort();
                            generate_bucket_listing(files);
                        },
                        error: function(data) {
                            alert(data);
                        }
                    });
            });
    };

    var init_fileupload_field = function () {
        $fileupload_field.fileupload({
                url: protocolurl + bucket + s3url + '/',
                type: 'POST',
                autoUpload: true,
                formData: {
                    key: '${filename}',
                    AWSAccessKeyId: aws_access_key_id,
                    acl: aws_canned_acl,
                    policy: aws_policy_document_b64,
                    signature: aws_signature,
                    'Content-Type': 'application/octet-stream'
                }
            });
    };
    
    var login_form_beforeSubmit = function (formData, jqForm, options) {
        set_bucket(jqForm.find('input[name=bucket]').val());
        make_aws_policy_document();
        set_aws_access_key_id(jqForm.find('input[name=aws_access_key_id]').val());
        set_aws_secret_access_key(jqForm.find('input[name=aws_secret_access_key]').val());
        set_aws_signature(sign(aws_secret_access_key, aws_policy_document_b64));
        init_bucketlist();
        init_fileupload_field();
        return false;
    };

    var init_login_form = function (form_selector) {
        $login_form = jQuery(form_selector);
        $login_form.ajaxForm({beforeSubmit: login_form_beforeSubmit});
    };

    var init_logout_form = function (form_selector, div_logout_form_selector) {
        $logout_form = jQuery(form_selector);
        $div_logout_form = jQuery(div_logout_form_selector);
    }

    var init_from_qs = function (arg_qs) {
            qs = location_querystring(arg_qs);
            if (qs.bucket) {
                $login_form.find('input[name=bucket]').val(qs.bucket);
            }
            if (qs.aws_access_key_id) {
                $login_form.find('input[name=aws_access_key_id]').val(qs.aws_access_key_id);
            }
            if (qs.aws_secret_access_key) {
                $login_form.find('input[name=aws_secret_access_key]').val(qs.aws_secret_access_key);
            }
    };
    var init_autosubmit = function () {
            // Auto-submit form if all 3 params were given in qs
            if (qs.bucket && qs.aws_access_key_id && qs.aws_secret_access_key) {
                $login_form.submit();
            }
    };

    var init_dropzone_effect = function () {
        $(document).bind('dragover', function (e) {
                var dropZone = $div_upload_form,
                timeout = window.dropZoneTimeout;
                if (!timeout) {
                    dropZone.addClass('in');
                } else {
                    clearTimeout(timeout);
                }
                if (e.target === dropZone[0]) {
                    dropZone.addClass('hover');
                } else {
                    dropZone.removeClass('hover');
                }
                window.dropZoneTimeout = setTimeout(function () {
                        window.dropZoneTimeout = null;
                        dropZone.removeClass('in hover');
                }, 100);
        });
    };

    return {
        set_aws_access_key_id: function (args) {
            set_aws_access_key_id(args);
        },
        init: function (args) {
            init_login_form(args.login_form);
            init_logout_form(args.logout_form, args.div_logout_form);
            init_from_qs(args.qs);
            set_bucketlist(args.bucketlist);
            set_fileupload_field(args.fileupload_field);
            set_div_upload_form(args.div_upload_form);
            init_dropzone_effect();
            init_autosubmit();
        }
    };
};
