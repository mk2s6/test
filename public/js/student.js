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
		var id = selector.val();
		$('#display').html("");

		$.ajax({
			url: '/getImage/'+id,
			type: 'GET',
			success : function (res) {
				var img = document.createElement('img');
				img.src = 'data:image/jpeg;base64,' + res;
				$(img).addClass('mdc-image-list__image');
				$('#display').append(img);
			},
            error : function (res,e, ts, et) {
                console.log(res +" some error " + ts + " " + et);
            }
		});
	});	
});
