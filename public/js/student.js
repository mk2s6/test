$(function() {

	var selector = $('#optionSelector'),
		optionTemplate = "<option value='{{id}}'>{{id}}</option>"

	function options(opt) {
		$.each(opt, function(i, option) {
			selector.append(Mustache.render(optionTemplate, option));
		});
	}
	count = 0 ;

	$('#selector').delegate('#optionSelector', 'click', function(event) {
		event.preventDefault();
		if ( count === 0) {
			selector.html("");
			count++;
			$.ajax({
				url : '/getOptions',
				type: 'GET',
				dataType: 'json',
				success : function (res) {
					if (res.options.length > 0) {
						options(res.options);
					}
				},
	            error : function (res,e, ts, et) {
	                console.log(res +" some error " + ts + " " + et);
	            }
			});
		}	
	});

	$('#getImage').on('click', function(event) {
		event.preventDefault();
		// console.log(selector.val());
		var id = selector.val();
		$('#display').html("");

		$.ajax({
			url: '/getImage/'+id,
			type: 'GET',
			processData : false,
			contentType : false,
			success : function (res) {
				console.log(res.img[0].img.data);
				var blob = blobUtil.arrayBufferToBlob(res.img[0].img.data);
				// var bytes = new Unit8Array(res.str[0].img.data);
				// var string = String.fromCharCode.apply(null, res.str[0].img.data);
				// var base64 = btoa(string);

				// var image = $.parseJSON(res.str[0].img.data);
				// var urlCreator = window.URL || window.webkitURL;
   	// 			var imageUrl = urlCreator.createObjectURL(image);

   	// 			var blob = new Blob(res.str[0].img.data, {type: 'image/jpeg'});
			   	var blobURL = blobUtil.createObjectURL(blob);

				var img = document.createElement('img');
				// img.src = 'data:image/jpeg;base64,' + btoa(unescape(encodeURIComponent(res.str[0].img.data)));
				// img.src = blobURL;
				img.src = URL.createObjectURL(blob);

				$('#display').append(img);
				// // $('#display').append(image);

			},
            error : function (res,e, ts, et) {
                console.log(res +" some error " + ts + " " + et);
            }
		});
	});	


});
	// function hexToBase64(str) {
 //    	return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
	// }