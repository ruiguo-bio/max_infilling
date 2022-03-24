const axios = require('axios');

var fs = require('fs');
var parseMidi = require('midi-file').parseMidi
const os = require("os");

const path = require("path");
var user_name = ""

// Another node module! URL if for working with URL's of course.
// You'll notice a slightly different syntax here, that actually assigns the value
// of the variable URL to the URL property of the url module. For more info, see
// https://nodejs.org/docs/latest-v8.x/api/url.html#url_url_pathname
const {
	URL
} = require("url");

// max-api is only available when running this script from Max.
const maxApi = require("max-api");

const BASE_URL = "http://47.253.212.37:5000";


const args = process.argv;
// maxApi.outlet('hi there');


function test(midi_name) {
	maxApi.post('test');
	maxApi.outlet("test",midi_name);

}



function file_info(midi_name) { 
	maxApi.post("file info");
	midi_name = midi_name.split(':')[1];
	var input = fs.readFileSync(midi_name);
// console.log(input);
	var parsed = parseMidi(input);

	maxApi.outlet("info",	parsed.tracks.length-1);

	


}

// function send_midi(midi_name,...args) {
// 	const apiurl = `${BASE_URL}/separate`;
// 	maxApi.post(apiurl);
	
// 	midi_name = midi_name.split(':')[1];
// 	maxApi.post(midi_name);
	
// 	const form = new URLSearchParams();
	
	
// 	const midi = fs.readFileSync(midi_name,{encoding: "binary"});
	
// 	// maxApi.post(midi);
// 	base_name = path.basename(midi_name);
// 	// maxApi.post(base_name);
// 	// maxApi.outlet(midi_name);
// 	form.append('file', midi);
// 	form.append('filename', base_name);
// 	// form.append('track', [1, 2]);
// 	// form.append('bar', [[3, 4, 5], [6, 7, 8]]);
// 	form.append('user_name', 'abc');

// 	maxApi.post(form);
	

// 	// maxApi.post(formData);
	
// 	const config = {
// 		headers: {
// 			'content-type': 'multipart/form-data'
// 		}
// 	};

// 	axios.request({
// 		url: apiurl,
// 		method: 'POST',
// 		headers:config,
// 		data: form,
	
// 	})
// 		.then(function (response) {
		
		
// 		maxApi.post(response.data);
// 		maxApi.post('write');
// 		fs.writeFileSync('result.mid', response.data,);
// 		console.log('test');

		
//   })
//   .catch(function (error) {
// 		maxApi.post(error);
		
//   });

// }




function cal_control(midi_name, track_types) {
	
	maxApi.post('calculate control');
	maxApi.post(track_types);
	midi_name = midi_name.split(':')[1];
	maxApi.post(midi_name);
	maxApi.post(track_types);
	
	const user_name = 'default'
	const base_name = path.basename(midi_name)
	maxApi.post(base_name)
	const apiurl = `${BASE_URL}/cal_control`;
	
	
	fs.readFile(midi_name, encoding='binary',async (error, data) => {
		if (error) {
			maxApi.post(error);
			return;
		}
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		};
		const form = new URLSearchParams();
		form.append('file', data)
		
		form.append('filename', base_name)
		form.append('user_name', user_name);
		form.append('track_types', track_types);
			
		axios.request({
			url: apiurl,
			method: 'POST',
			headers: config,
			data: form,
			responseType: 'stream'
		})
			.then(response => {
				// maxApi.post(response);
				
				
				const meta = JSON.parse(response.headers['x-metadata']);
				const controls = meta.controls;
				// maxApi.post(controls);
				const file_name = controls['file_name'];
				// maxApi.post(file_name);
				
				const new_name = file_name.slice(0, -7) + 'result.mid';
				maxApi.post(new_name);
				
				
				
				var writableStream = fs.createWriteStream(file_name);
				var writableStream_copy = fs.createWriteStream(new_name);
				response.data.on('data', function(chunk) {
					writableStream.write(chunk);
					writableStream_copy.write(chunk);
				});
				// response.data.pipe(fs.createWriteStream(original_name));
				maxApi.outlet('control',controls);
				
			})
			.catch(function (error) {
				maxApi.post(error);
						
			});
	});
}


maxApi.addHandler("original", (name) => {

	const new_name = name.slice(0,-7) + 'result.mid';
	const old_name = name.slice(0, -7) + 'ori.mid';
	maxApi.post(`use ${old_name} as input`);
	
	
	fs.copyFile(old_name, new_name, (err) => {
		if (err) {
			
		}
		else {
			maxApi.post(`use ${old_name} as input`);
			maxApi.outlet('original', new_name);
			
		}
	});
	
});

maxApi.addHandler("new", (name) => {
	const new_name = name.slice(0,-7) + 'result.mid';
	const old_name = name.slice(0,-7) + 'tem.mid';
	
	
	fs.copyFile(old_name, new_name, (err) => {
		if (err) {
			
		}
		else {
			maxApi.post(`use ${old_name} as input`);
			maxApi.outlet('new', new_name);
			
		}
	});
	
});


maxApi.addHandler("change", (name, ...args) => {
	maxApi.post(name)
	maxApi.post(args)
	
});


maxApi.addHandler("info", (name) => {


	// result = file_info(name);
	maxApi.post('info');
	midi_name = name.split(':')[1];
	extname = path.extname(midi_name);
	// maxApi.post(extname);
	var stats = fs.statSync(midi_name)
	var fileSizeInKBy = stats.size / 1024;
	
	// maxApi.post(fileSizeInKBy);

	if (extname == '.mid' && fileSizeInKBy < 100) {
		maxApi.post(midi_name);
		fs.readFile(midi_name, encoding = 'binary', async (error, data) => {
			if (error) {
				maxApi.post(error);
				return;
			}
			const apiurl = `${BASE_URL}/info`;
			const base_name = path.basename(midi_name)
	
			const form = new URLSearchParams();

			form.append('file', data);
			form.append('user_name', user_name);
		
			form.append('filename', base_name);
		
	
			const config = {
				headers: {
					'content-type': 'multipart/form-data'
				}
			};
		
		
			axios.request({
				url: apiurl,
				method: 'POST',
				headers: config,
				data: form,
				responseType: 'json'
			})
				.then(response => {
		
					maxApi.post("info", response.data);
			
					maxApi.outlet("info", response.data);
			
			
				})
				.catch(function (error) {
					maxApi.post(error);
					
				});
		});
	}
	else {
		maxApi.post('not valid midi file');
	}
	
});


maxApi.addHandler("infill", (midi_name, parameters) => {
	
	maxApi.post("infill");
	
	controls = parameters;
	controls["user_name"] = user_name
	// parameters.pop();
	maxApi.post(midi_name);
	const json_control = JSON.stringify(controls)
	maxApi.post(json_control);
	extname = path.extname(midi_name);
	var stats = fs.statSync(midi_name)
	var fileSizeInKBy = stats.size / 1024;

	if (extname == '.mid' && fileSizeInKBy < 50) {
		old_name = midi_name.split('_').slice(0, -1).join('_') + '_result.mid'
		
		if (controls['go_back'] == 1) {
			
			midi_name = old_name
			maxApi.post(`use the last result file ${midi_name}`);
			
		}
		else {
			
			fs.copyFile(midi_name, old_name, () => {
				maxApi.post(`replace the old file ${old_name} by ${midi_name}`);
			});
				
			
		}
	

	

		fs.readFile(midi_name, encoding = 'binary', async (error, data) => {
			if (error) {
				maxApi.post(error);
				return;
			}


			const apiurl = `${BASE_URL}/infill`;
		
			const base_name = path.basename(midi_name)

		
			maxApi.post(base_name);
	
			const form = new URLSearchParams();
	
			form.append('parameters', parameters);
	
			form.append('file', data);
		
			form.append('filename', base_name);

			form.append('controls', json_control);

			const config = {
				headers: {
					'content-type': 'multipart/form-data'
				}
			};
		
			var controls;
			axios.request({
				url: apiurl,
				method: 'POST',
				headers: config,
				data: form,
				responseType: 'stream'
			})
				.then(response => {
				
				
					const meta = JSON.parse(response.headers['x-metadata']);
					controls = meta.controls;
					// maxApi.post(controls);
					// maxApi.post(response.data);
					// fs.writeFileSync(controls.file_name, response.data);
					// maxApi.outlet('control',controls);
					maxApi.post(`the return file name is ${controls.file_name}`);
					const writeStream = fs.createWriteStream(controls.file_name);

					response.data.on('data', function (chunk) {
						writeStream.write(chunk);
					});
					response.data.on('end', function () {
						maxApi.outlet('control', controls)
					});
					// response.data.pipe(writeStream);
					// 	writeStream.on('end', function () {
					// 		maxApi.post('finish');
					// 		maxApi.outlet('control', controls)
					//  });
				})
				.catch(function (error) {
					maxApi.post(error);
						
				});
		});
	}
	else {
		maxApi.post('info','failure')
	}

});




maxApi.addHandler("text", (name) => {
	const apiurl = `${BASE_URL}/login`;
	
	maxApi.post("login");
	
	const form = new URLSearchParams();

	form.append('user_name', name);
	user_name = name;
	
	const config = {
		headers: {
			'content-type': 'multipart/form-data'
		}
	};
		
	axios.request({
		url: apiurl,
		method: 'POST',
		headers: config,
		data: form,
		responseType: 'json'
	})
		.then(response => {
			result = response.data
			if (result["login"] == "success") {
				maxApi.outlet("login", "success");
			}
			else {
				maxApi.outlet("login", "user name not exist");
			}
				
			
			
		})
		.catch(function (error) {
			maxApi.post(error);
					
		});
});

maxApi.addHandler("keep", (name) => {
	new_name = name.slice(0, -8) + 'result.mid'
	if (fs.existsSync(name)){
	fs.rename(name, new_name, () => {
		maxApi.post(`keep the infilled file as ${new_name}`);
		maxApi.outlet("keep", new_name);
		 
		// List all the filenames after renaming
		
	});
	}
	else {
		
		maxApi.post(`file ${name} not exist`);
	}
});

maxApi.addHandler("control", (controls, midi_name) => {
	midi_name = midi_name.split(':')[1];
	extname = path.extname(midi_name);
	var stats = fs.statSync(midi_name)
	var fileSizeInKBy = stats.size / 1024;
	
	if (extname == '.mid' && fileSizeInKBy < 100) {

		result = cal_control1(controls, midi_name);
	}
	else {
		maxApi.post('cal control', 'failure');
	}
	
});

maxApi.addHandler("test", (name) => {
	test(name);
});


function cal_control1(controls, midi_name) {
	maxApi.post('calculate control');
	maxApi.post(controls);
	
	maxApi.post(midi_name);

	
	
	const base_name = path.basename(midi_name)
	maxApi.post(base_name)
	const apiurl = `${BASE_URL}/cal_control`;
	
	
	fs.readFile(midi_name, encoding='binary',async (error, data) => {
		if (error) {
			maxApi.post(error);
			return;
		}
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		};
		const form = new URLSearchParams();
		form.append('file', data)
		
		form.append('filename', base_name)
		form.append('user_name', user_name);
		form.append('track_0', controls.track_0);
		form.append('track_1', controls.track_1);
		form.append('track_2', controls.track_2);
		form.append('start_bar', controls.start_bar);
		form.append('key', controls.key);
			
		axios.request({
			url: apiurl,
			method: 'POST',
			headers: config,
			data: form,
			responseType: 'stream'
		})
			.then(response => {
				// maxApi.post(response);
				
				
				const meta = JSON.parse(response.headers['x-metadata']);
				const controls = meta.controls;
				// maxApi.post(controls);
				const file_name = controls['file_name'];
				// maxApi.post(file_name);
				
				const new_name = file_name.split('_').slice(0,-1).join('_') + '_result.mid'
				maxApi.post(new_name);
				controls['file_name'] = new_name
				
				
				var writableStream = fs.createWriteStream(file_name);
				var writableStream_copy = fs.createWriteStream(new_name);
				response.data.on('data', function(chunk) {
					writableStream.write(chunk);
					writableStream_copy.write(chunk);
				});
				// response.data.pipe(fs.createWriteStream(original_name));
				maxApi.outlet('control',controls);
				
			})
			.catch(function (error) {
				maxApi.post(error);
						
			});
	});




}
