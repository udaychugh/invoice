var today = new Date();

var year = today.getFullYear();
var month = today.getMonth() + 1; 
var day = today.getDate();

var formattedDate = year + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;

/* Shivving (IE8 is not supported, but at least it won't look as awful)
/* ========================================================================== */

(function (document) {
	var
	head = document.head = document.getElementsByTagName('head')[0] || document.documentElement,
	elements = 'article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output picture progress section summary time video x'.split(' '),
	elementsLength = elements.length,
	elementsIndex = 0,
	element;

	while (elementsIndex < elementsLength) {
		element = document.createElement(elements[++elementsIndex]);
	}

	element.innerHTML = 'x<style>' +
		'article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}' +
		'audio[controls],canvas,video{display:inline-block}' +
		'[hidden],audio{display:none}' +
		'mark{background:#FF0;color:#000}' +
	'</style>';

	return head.insertBefore(element.lastChild, head.firstChild);
})(document);

/* Prototyping
/* ========================================================================== */

(function (window, ElementPrototype, ArrayPrototype, polyfill) {
	function NodeList() { [polyfill] }
	NodeList.prototype.length = ArrayPrototype.length;

	ElementPrototype.matchesSelector = ElementPrototype.matchesSelector ||
	ElementPrototype.mozMatchesSelector ||
	ElementPrototype.msMatchesSelector ||
	ElementPrototype.oMatchesSelector ||
	ElementPrototype.webkitMatchesSelector ||
	function matchesSelector(selector) {
		return ArrayPrototype.indexOf.call(this.parentNode.querySelectorAll(selector), this) > -1;
	};

	ElementPrototype.ancestorQuerySelectorAll = ElementPrototype.ancestorQuerySelectorAll ||
	ElementPrototype.mozAncestorQuerySelectorAll ||
	ElementPrototype.msAncestorQuerySelectorAll ||
	ElementPrototype.oAncestorQuerySelectorAll ||
	ElementPrototype.webkitAncestorQuerySelectorAll ||
	function ancestorQuerySelectorAll(selector) {
		for (var cite = this, newNodeList = new NodeList; cite = cite.parentElement;) {
			if (cite.matchesSelector(selector)) ArrayPrototype.push.call(newNodeList, cite);
		}

		return newNodeList;
	};

	ElementPrototype.ancestorQuerySelector = ElementPrototype.ancestorQuerySelector ||
	ElementPrototype.mozAncestorQuerySelector ||
	ElementPrototype.msAncestorQuerySelector ||
	ElementPrototype.oAncestorQuerySelector ||
	ElementPrototype.webkitAncestorQuerySelector ||
	function ancestorQuerySelector(selector) {
		return this.ancestorQuerySelectorAll(selector)[0] || null;
	};
})(this, Element.prototype, Array.prototype);

/* Helper Functions
/* ========================================================================== */

function generateTableRow() {
	var emptyColumn = document.createElement('tr');

	emptyColumn.innerHTML = '<td class="greenaddtion"><a class="cut">-</a><span contenteditable></span></td>' +
		'<td class="greenaddtion"><span data-prefix>₹</span><span contenteditable>0.00</span></td>' +
		'<td class="greenaddtion"><span contenteditable>0</span></td>' +
		'<td class="greenaddtion"><span contenteditable>0</span></td>' +
		'<td class="greenaddtion"><span data-prefix>₹</span><span>0.00</span></td>';

	return emptyColumn;
}

function parseFloatHTML(element) {
	return parseFloat(element.innerHTML.replace(/[^\d\.\-]+/g, '')) || 0;
}

function parsePrice(number) {
	return number.toFixed(2).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1,');
}

/* Update Number
/* ========================================================================== */

function updateNumber(e) {
	var
	activeElement = document.activeElement,
	value = parseFloat(activeElement.innerHTML),
	wasPrice = activeElement.innerHTML == parsePrice(parseFloatHTML(activeElement));

	if (!isNaN(value) && (e.keyCode == 38 || e.keyCode == 40 || e.wheelDeltaY)) {
		e.preventDefault();

		value += e.keyCode == 38 ? 1 : e.keyCode == 40 ? -1 : Math.round(e.wheelDelta * 0.025);
		value = Math.max(value, 0);

		activeElement.innerHTML = wasPrice ? parsePrice(value) : value;
	}

	updateInvoice();
}

/* Update Invoice
/* ========================================================================== */

function updateInvoice() {
	var total = 0;
	var cells, price, total, a, i;

	// update inventory cells
	// ======================

	for (var a = document.querySelectorAll('table.inventory tbody tr'), i = 0; a[i]; ++i) {
		// get inventory row cells
		cells = a[i].querySelectorAll('span:last-child');

		// set price as cell[1] * cell[2]
		price = (parseFloatHTML(cells[1]) * parseFloatHTML(cells[2])) - (((parseFloatHTML(cells[1]) * parseFloatHTML(cells[2]) * parseFloatHTML(cells[3]))) / 100);

		// add price to total
		total += price;

		// set row total
		cells[4].innerHTML = price;
	}

	// update balance cells
	// ====================

	// get balance cells
	cells = document.querySelectorAll('table.balance td:last-child span:last-child');

	// set total
	cells[0].innerHTML = total;

	// set balance and meta balance
	cells[2].innerHTML = document.querySelector('table.meta tr:last-child td:last-child span:last-child').innerHTML = parsePrice(total - parseFloatHTML(cells[1]));

	// update prefix formatting
	// ========================

	var prefix = document.querySelector('#prefix').innerHTML;
	for (a = document.querySelectorAll('[data-prefix]'), i = 0; a[i]; ++i) a[i].innerHTML = prefix;

	// update price formatting
	// =======================

	for (a = document.querySelectorAll('span[data-prefix] + span'), i = 0; a[i]; ++i) if (document.activeElement != a[i]) a[i].innerHTML = parsePrice(parseFloatHTML(a[i]));
}

/* On Content Load
/* ========================================================================== */

function onContentLoad() {
	updateInvoice();

	document.getElementById("todaydate").innerText  = formattedDate

	var
	input = document.querySelector('input'),
	image = document.querySelector('img');

	function onClick(e) {
		var element = e.target.querySelector('[contenteditable]'), row;

		element && e.target != document.documentElement && e.target != document.body && element.focus();

		if (e.target.matchesSelector('.add')) {
			document.querySelector('table.inventory tbody').appendChild(generateTableRow());
		}
		else if (e.target.className == 'cut') {
			row = e.target.ancestorQuerySelector('tr');

			row.parentNode.removeChild(row);
		} else if (e.target.matchesSelector('#printInvoice')) {
			window.print();
		} else if (e.target.matchesSelector('#saveInvoice')) {
			openSaveInvoiceBox()
		} else if (e.target.matchesSelector('#loadInvoice')) {
			openLoadInvoiceBox()
		}

		updateInvoice();
	}

	function onEnterCancel(e) {
		e.preventDefault();

		image.classList.add('hover');
	}

	function onLeaveCancel(e) {
		e.preventDefault();

		image.classList.remove('hover');
	}

	function onFileInput(e) {
		image.classList.remove('hover');

		var
		reader = new FileReader(),
		files = e.dataTransfer ? e.dataTransfer.files : e.target.files,
		i = 0;

		reader.onload = onFileLoad;

		while (files[i]) reader.readAsDataURL(files[i++]);
	}

	function onFileLoad(e) {
		var data = e.target.result;

		image.src = data;
	}

	if (window.addEventListener) {
		document.addEventListener('click', onClick);

		document.addEventListener('mousewheel', updateNumber);
		document.addEventListener('keydown', updateNumber);

		document.addEventListener('keydown', updateInvoice);
		document.addEventListener('keyup', updateInvoice);

		input.addEventListener('focus', onEnterCancel);
		input.addEventListener('mouseover', onEnterCancel);
		input.addEventListener('dragover', onEnterCancel);
		input.addEventListener('dragenter', onEnterCancel);

		input.addEventListener('blur', onLeaveCancel);
		input.addEventListener('dragleave', onLeaveCancel);
		input.addEventListener('mouseout', onLeaveCancel);

		input.addEventListener('drop', onFileInput);
		input.addEventListener('change', onFileInput);
	}
}

function openSaveInvoiceBox() {
	Swal.fire({
		title: "Enter your file name",
		input: "text",
		inputAttributes: {
		  autocapitalize: "off"
		},
		showCancelButton: true,
		confirmButtonText: "Save",
		confirmButtonColor: "#fa1818",
		showLoaderOnConfirm: false,
		preConfirm: (fileName) => {
		  return new Promise((resolve, reject) => {
			resolve();
			if (fileName.length >= 3) {
			  console.log("Entered file name:", fileName);
			  saveInvoice(fileName);
			} else {
				Swal.fire({
					title: "Error",
					text: "File name must be at least 3 characters long",
					icon: "error",
					confirmButtonText: "Okay!",
					confirmButtonColor: "#fa1818",
				  });
			}
		  });
		}
	  });
	  
}

function saveInvoice(fileName) {
	//Seller address
	var sellerName = document.getElementById('seller_name').innerText;
	var addressLine = document.getElementById('address_line').innerText;
	var userPhone = document.getElementById('user_phone_number').innerText;
	var userEmail = document.getElementById('user_email').innerText;

	//Client Info
	var clientName = document.getElementById('client_name').innerText;
	var clientAddress = document.getElementById('client_address').innerText;
	var clientPhone = document.getElementById('client_phone').innerText;

	//Invoice Basic Info
	var invoiceNo = document.getElementById('invoice_number').innerText;
	var invoiceDate = document.getElementById('todaydate').innerText;
	var invoiceAmountDue = document.getElementById('invoice_amount_due').innerText;

	//Invoice Amounts
	var totalAmount = document.getElementById('total_amount').innerText;
	var paidAmount = document.getElementById('amount_paid').innerText;
	var balanceDue = document.getElementById('balance_due').innerText;

	//Footer Info
	var footerLine1 = document.getElementById('footer_line_1').innerText;
	var footerLine2 = document.getElementById('footer_line_2').innerText;
	var footerLine3 = document.getElementById('footer_line_3').innerText;

	//Get Products Name
	var tbody = document.querySelector('.inventory tbody');
	var rows = tbody.querySelectorAll('tr');
	var data = [];
	rows.forEach(function(row) {
		// Get all cells in the row
		var cells = row.querySelectorAll('td span:last-child');
	
		// Create an object to store cell data
		var rowData = {};
	
		// Iterate over each cell and store its content
		cells.forEach(function(cell, index) {
		  rowData['column' + index] = cell.textContent.trim();
		});
	
		// Push the object into the data array
		data.push(rowData);
	  });
	  
	var invoiceJson = {
		seller_name: sellerName,
		address_line: addressLine,
		user_phone: userPhone,
		user_email: userEmail,
		client_name: clientName,
		client_address: clientAddress,
		client_phone: clientPhone,
		invoice_number: invoiceNo,
		invoice_date: invoiceDate,
		invoice_amount_due: invoiceAmountDue,
		invoice_data: data,
		total_amount: totalAmount,
		paid_amount: paidAmount,
		balance_due: balanceDue,
		footer_line_1: footerLine1,
		footer_line_2: footerLine2,
		footer_line_3: footerLine3
	};

	var jsonObject = {
		invoice_json: invoiceJson 
	};

	var jsonString = JSON.stringify(jsonObject, null, 2); 
	// Save JSON string as JSON file
	var blob = new Blob([jsonString], { type: 'application/json' });
	var link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = fileName + '.json';
	link.click();

	Swal.fire({
		title: "Success",
		text: "Invoice saved in your device.",
		icon: "success",
		confirmButtonText: "Yayyy!!",
		confirmButtonColor: "#fa1818",
	  });
}

function openLoadInvoiceBox() {
	Swal.fire({
		title: "Upload your invoice",
		input: "file",
		inputAttributes: {
			accept: "application/json",
		  	autocapitalize: "off"
		},
		showCancelButton: true,
		confirmButtonText: "Load",
		confirmButtonColor: "#fa1818",
		showLoaderOnConfirm: false,
		preConfirm: (file) => {
			return new Promise((resolve, reject) => {
				if (!file) {
				  reject("Please select a file");
				  return;
				}
		
				const reader = new FileReader();
				reader.onload = (event) => {
				  try {
					
					const jsonContent = JSON.parse(event.target.result);
					
					if (jsonContent && jsonContent.invoice_json) {
						console.log("json content = ", jsonContent);
					  loadInvoice(jsonContent.invoice_json);
					  resolve();
					} else {
					  reject("Invalid file format. Please provide a valid JSON file with 'invoice_json' property.");
					}
				  } catch (error) {
					reject("Error parsing JSON file. Please provide a valid JSON file.");
				  }
				};
		
				reader.readAsText(file);
			  });
		}
	  });
}

function loadInvoice(fileJson) {
	const sellerName = fileJson.seller_name;
	const addressLine = fileJson.client_name;
	const userPhone = fileJson.user_phone;
	const userEmail = fileJson.user_email;
	const clientName = fileJson.client_name;
	const clientAddress = fileJson.client_address;
	const clientPhone = fileJson.client_phone;
	const invoiceNo = fileJson.invoice_number;
	const invoiceDate = fileJson.invoice_date;
	const invoiceAmountDue = fileJson.invoice_amount_due;

	const totalAmount = fileJson.total_amount;
}

window.addEventListener && document.addEventListener('DOMContentLoaded', onContentLoad);