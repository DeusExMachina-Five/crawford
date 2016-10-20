// Roxxo 
function errorField($field, error) {
    $formGroup = $field.closest('.form-group');
    $formGroup.addClass('has-error');
    $('span', $formGroup).text(error);
}

function updateConnectionStatus(text) {
    $('#label-status-connection').html(text);
}

function updateRepositoryStatus(text) {
    $('#label-status-repository').html(text);
}

function show(element) {
    return $(element).removeClass('hidden');
}

function hide(element) {
    return $(element).addClass('hidden');
}

function disable(element) {
    return $(element).addClass('disabled');
}

function enable(element) {
    return $(element).removeClass('disabled');
}

function populateCMISInfo(data) {
    $('#dd-cmis-version').text(data.cmisVersionSupported);
    $('#dd-cmis-product-name').text(data.productName);
    $('#dd-cmis-product-version').text(data.productVersion);
    $('#dd-cmis-repository-name').text(data.repositoryName);
    $('#dd-cmis-repository-version').text(data.repositoryVersion);
    $('#dd-cmis-repository-url').text(data.repositoryUrl);
}

onClickLogin = function() {
	console.log("Login starting");
    var username = $('#input-username').val();
    var password = $('#input-password').val();
    // hard coding needs to be removed and replaced with a configuration file
	loginCMIS('http://localhost:5000/browser', username, password);
	// populateCMISInfo(session.repositories[name]);
}

onClickSelect = function(selectedItem) {
	console.log("Select starting on " + selectedItem);
    loadDocuments(selectedItem);
}

function loginCMIS(serverUrl, username, password) {
    var $loginInputs = $('.input-login');
    var $select = $('#select-repository');
    
    $select.empty();
    
    $loginInputs.attr('disabled', true);
    
    session = cmis.createSession(serverUrl);
    session.setCredentials(username, password).loadRepositories({
        request: {
            success: function(data) {
                var repositoriesCount = Object.keys(data).length;
                
                $.each(data, function(name, information) {
                    $select.append('<option value="' + name + '">' + name + '</option>');
                });
                
                $select.attr('disabled', false);
                
                selectRepository(Object.keys(data)[0]);
                repositories = data;
                
                updateConnectionStatus('Logged in as <strong>' + username + '</strong>');
                
                $loginInputs.text('Log Out');
                $loginInputs.removeClass('btn-success');
                $loginInputs.addClass('btn-danger');
                enable('.input-needslogin');
                
                connected = true;
                
                $loginInputs.attr('disabled', false);
                
                $('#input-server').attr('disabled', true);
                $('#input-username').attr('disabled', true);
                $('#input-password').attr('disabled', true);

                $('div').find('#display-username').fadeIn();

                // fade out the main blurb and then load the select HTML
                $('div').find('#blurb').fadeOut();
                $('div').find('#data').load('select-template.html', null, function complete() {
                    $( '.get-data').each(function () {
                        $(this).click(function( event ) {                
                           console.log($(this).text());
                           onClickSelect($(this).text());
                           // $('#myScript').css({"color": "blue", "border": "2px solid red"});                   
                        }); 
                    }); // each
            	});
            },
            error: function(data) {
                if (data['status'] === 401) {
                    errorField($('#input-username'), 'Could not log in with the specified credentials');
                } else {
                    errorField($('#input-server'), 'Could not connect to server: ');
                }
                logoutCMIS();
                
                $loginInputs.attr('disabled', false);
            }
        }
    });
}

function logoutCMIS() {
    session = {};
    connected = false;
    updateConnectionStatus('Disconnected');
    updateRepositoryStatus('');
    var $select = $('#select-repository');
    $select.empty();
    hide('#link-server-info');
    
    $loginInputs = $('.input-login');
    
    // $loginInputs.text('Log In');
    $loginInputs.removeClass('btn-danger');
    $loginInputs.addClass('btn-success');
    disable('.input-needslogin');
    $('#select-repository').attr('disabled', true);
    
    $('#input-server').attr('disabled', false);
    $('#input-username').attr('disabled', false);
    $('#input-password').attr('disabled', false);
    
    if (!$('#login').hasClass('active')) {
        $('#tab-login').tab('show');
    }
}

function updateConnectionStatus(text) {
    $('#label-status-connection').html(text);
}

function selectRepository(name) {
    updateRepositoryStatus(' to ' + name);
    show('#link-server-info');
    session.defaultRepository = session.repositories[name];
    populateCMISInfo(session.repositories[name]);
}

function loadDocuments(selectedItems) {
	var cmisType = "cmis:document";
	var whereCondition = "cmis:description LIKE '" + selectedItems +"'";
	// var whereCondition = "cmis:name LIKE ('%Bike%')";
	// var whereCondition = "1 = 1";
	var orderBy = "cmis:name";

	var query = "SELECT * FROM " + cmisType + " WHERE " + whereCondition + " ORDER BY " + orderBy;
	console.log(query)

	// Send the query
	session.query(query, false, {
		includeAllowableActions : true,
		// skipCount : (pageIndex - 1) * maxItems,
		skipcount : 0,
		// maxItems : maxItems,
		maxItems : 10,
		request : {
			success : function(data) {
				// Display the result of the query
				console.log('Query executed - displaying results');
				_displayQueryResult(data.results, selectedItems);
				// Append the pagination block
				// library._appendPagination(data.hasMoreItems, data.numItems, "_onClickSearch");
			},
			error : function(jqXHR, textStatus, errorThrown) {
				// Display an error message
				// library._addError("Can't execute the query " + query + ".");
				errorField($('#input-username'), "Can't execute the query " + query + ".");

			}
		}
	});	
}

	/**
	 * Display the result of a query
	 * 
	 * @items: Array of nodes to display
	 */
	_displayQueryResult = function(items, selectedItems) {
		// NOTE: library.element replaced with element
		// var session = this.options.cmis.session;
		var library = this;
		var element = document;		// NEW

		// Refresh the table header
		// library._refreshTableHeader();

		// Delete the no document warning
		$(element).find(".noDocument").hide();

		// Save the previous folder Id
		$(element).attr("previousId", $(element).attr("id"));
		$(element).attr("id", null);

		// Show the clean search
		$(element).find("#queryClean").show();

		// Clean the list of files in the table
		var panel = '.tableBody-' + selectedItems.replace(/ /g,'')
		var list = $(element).find(panel);
		// var list = $(element).find(".get-data");
		$(list).empty();

		// If the list is empty
		if (items.length == 0)
			if ($(library.element).find(".noDocument").length == 0)
				$(list).closest(".documentlist .table").after("<div class='noDocument'>There is no document matching this query.");
			else
				$(library.element).find(".noDocument").show();
		else {
			// For each node
			$(items).each(function(index) {
				// Append a new item in the table
//				_appendItem(list, $(this));
				_appendItem(list, this);				
			});
		}

		$(library.element).find(".documentlist").fadeIn();
		$(library.element).find("#overlay").fadeOut();

	};

	/**
	 * Append an item in the document list table.
	 * 
	 * @list: HTML Document List
	 * @data: New item to add to the list
	 */
	_appendItem = function(list, data) {
		var library = this;

		// Check the type - was here

		// Generate HTML
		var newItem = library._generateElement(data, $("#cmis-library-row-template"));

		// Append HTMl
		$(list).append(newItem);

		// Attach actions
//		library._attachActions(newItem);

		// Call event - REMOVED - not sure what this is doing here
//		if (library.options.events.documentAdded != null)
//			library.options.events.documentAdded(library, newItem, data);

	};
	
	/**
	 * Generates HTML code from a template and a JSON object
	 * 
	 * @data: JSON object used as data source
	 * @template: HTML template
	 */
	_generateElement = function(data, template) {
		var library = this;
//		var session = library.options.cmis.session;
		
		// DEBUG
		$(Object.keys(data.properties)).each(function(index, argName) {
			var value = data.properties[argName].value;
			var type = data.properties[argName].type;
		    console.log('type: ' + type + '\n' + 'value: ' + value);
		});

		var newElem = template.html();
		var objectId = data.properties["cmis:objectId"].value;

		// Replace properties
		$(Object.keys(data.properties)).each(function(index, argName) {
			var regexp = new RegExp('\\$\\{' + argName + '\\}', 'g');

			var value = data.properties[argName].value;
			var type = data.properties[argName].type;

			// Check if there is a custom display function for this property - REMOVED
			// if (library.options.display.property != null && library.options.display.property[argName] != null)
			// 	value = library.options.display.property[argName](value, data);
			// else if (library.options.display.type != null && library.options.display.type[type] != null)
			// value = library.options.display.type[type](value, data);

			newElem = newElem.replace(regexp, value);
		});

		// Replace allowable actions
//		$(Object.keys(data.allowableActions)).each(function(index, argName) {
//			var regexp = new RegExp('\\$\\{' + argName + '\\}', 'g');
//			newElem = newElem.replace(regexp, data.allowableActions[argName]);
//		});

		// Replace pending elements
		var regexp = new RegExp('\\$\\{[A-Za-z0-9\-:_]*\\}', 'g');
		newElem = newElem.replace(regexp, "");

		newElem = $(newElem);

		// Replace the download URL
//		var url = session.getContentStreamURL(objectId, 'attachment');
//		newElem.find(".icon-download a, .download a").attr("href", url);
//		newElem.find(".icon-download").click(function() {
//			window.open(url);
//		});

		console.log('New Element: ' + newElem);	// NEW
		
		return newElem;
	};	
