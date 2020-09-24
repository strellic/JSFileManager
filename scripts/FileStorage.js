class StorageFile {
	constructor(name, mime, data, properties, path, loc) {
		this.type = "StorageFile";
		this.name = name;
		this.mime = mime;
		this.properties = properties;
		this.location = loc;

		if (!this.location) {
			this.location = '_' + +new Date() + '_' + Math.random().toString(36).substr(2, 9);
			localforage.setItem(this.location, data);
		}
	}
	getData() {
		return localforage.getItem(this.location);
	}
}

class StorageFolder {
	constructor(name, path, files) {
		this.type = "StorageFolder";
		this.name = name;
		this.path = path;
		this.files = files;
	}
	addFile(file) {
		if (this.files.findIndex(x => x.name === file.name) != -1 || file.name == "...") {
			console.log("[ERROR] Cannot add file, there already is one with the same name in this folder!");
			return false;
		} else {
			this.files.push(file);
			this.files = this.files.sort(function(a, b) {
				if (a.type == "StorageFolder" && a.type != b.type) return -1;
				if (b.type == "StorageFolder" && b.type != a.type) return 1;
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			});

			return true;
		}
	}
	getObject(name) {
		return this.files.find(x => x.name === name);
	}
	removeObject(name) {
		for (var i = 0; i < this.files.length; i++) {
			if (this.files[i].name == name) {
				if (this.files[i].type == "StorageFile")
					localforage.removeItem(this.files[i].location);
				this.files.splice(i, 1);
			}
		}
	}
}

class FileStorage {
	constructor(data = []) {
		this.type = "FileStorage";
		var d = data;
		var traverse = function(files, path) {
			for (var i = 0; i < files.length; i++) {
				if (files[i].type == "StorageFile") {
					files[i] = new StorageFile(files[i].name, files[i].mime, undefined, files[i].properties, path, files[i].location);
				} else {
					files[i] = new StorageFolder(files[i].name, path, files[i].files);
					traverse(files[i].files, path + files[i].name + "/");
				}
			}
		}
		traverse(d, "/");
		this.data = new StorageFolder("/", "/", d);
	}
	getFolder(path) {
		var steps = Utils.parsePath(path);
		var folder = this.data;
		for (var i = 0; i < steps.length; i++) {
			folder = folder.getObject(steps[i]);
		}
		return folder;
	}
}

var Items = [];
var Utils = {
	alert: function(title, text, type, timer) {
		return swal({
			title: title,
			html: text,
			timer: timer,
			type: type
		}).catch(swal.noop)
	},
	prompt: async function(title, text, type, value = "") {
			return await swal({
				title: title,
				html: text,
				inputValue: value,
				type: type,
				showCancelButton: !0,
				input: 'text'
			})
		}, containsAny: function(str, any) {
			for (var item of any) {
				if (str.includes(item))
					return item
			}
			return !1
		}, emptyObject: function(obj) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key))
					return !1
			}
			return !0
		}, getExt: function(a) {
			return a.split('.').pop()
		}, getFile: function(a) {
			return a.split('/').pop()
		}, remExt: function(a) {
			return a.substring(0, a.lastIndexOf("."))
		}, parsePath: function(path) {
			if (path.charAt(0) == path.slice(-1) && path.charAt(0) == "/") {
				return path.split("/").filter(Boolean)
			} else {
				console.log(`[ERROR] Invalid path being parsed!\n${path}`)
			}
		}, stepsToPath: function(steps) {
			var path = "/";
			for (var i = 0; i < steps.length; i++)
				path += steps[i] + "/";
			return path
		}, fileToIcon: function(item) {
			return item.name.split(".")[item.name.split(".").length - 1]
		}, dataURItoBlob: function(dataURI) {
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0)
				byteString = atob(dataURI.split(',')[1]);
			else byteString = unescape(dataURI.split(',')[1]);
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i)
			}
			return new Blob([ia], {
				type: mimeString
			})
		}, openItemInNewTab: function(item) {
			item.getData().then(function(data) {
				window.open(URL.createObjectURL(data || new Blob()));
			})
		}, downloadItem: function(item) {
			item.getData().then(function(data) {
				saveAs(data, item.name)
			})
		}, bytesToSize: function(a, b) {
			if (a == 0)
				return "0 Bytes";
			var c = 1024,
				d = b || 2,
				e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
				f = Math.floor(Math.log(a) / Math.log(c));
			return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f]
		},
		timeSince: function(date) {
			if (typeof date !== 'object') {
				date = new Date(date)
			}

			var sec = Math.floor((new Date() - date) / 1000);
			var type;
			var time = Math.floor(sec / (60 * 60 * 24 * 30 * (73 / 6)));
			if (time >= 1) {
				type = 'year'
			} else {
				time = Math.floor(sec / (60 * 60 * 24 * 30));
				if (time >= 1) {
					type = 'month'
				} else {
					time = Math.floor(sec / (60 * 60 * 24));
					if (time >= 1) {
						type = 'day'
					} else {
						time = Math.floor(sec / (60 * 60));
						if (time >= 1) {
							type = "hour"
						} else {
							time = Math.floor(sec / 60);
							if (time >= 1) {
								type = "minute"
							} else {
								time = sec;
								type = "second"
							}
						}
					}
				}
			}
			if (time > 1 || time === 0) {
				type += 's'
			}
			return time + ' ' + type
		},
}
var Client = {
	directory: "/",
	storage: null,
	get folder() {
		return this.storage.getFolder(this.directory)
	},
	fileCounter: 1,
	bookmarks: [],
	size: 0,
	maxSize: 0,
	limit: !0,
	openEditors: [],
	menuAnim: !1,
}
var FileManager = {
	list: function() {
		console.log("File System:");
		console.log(" ");
		var traverse = function(files, dashes = "") {
			for (var i = 0; i < files.length; i++) {
				if (files[i].type == "StorageFile") {
					console.log(dashes + "File   " + files[i].name)
				} else {
					console.log(dashes + "Folder " + files[i].name);
					dashes += "--";
					traverse(files[i].files, dashes);
					dashes = dashes.slice(0, -2)
				}
			}
		}
		traverse(Client.folder.files)
	},
	load: function() {
		localforage.getItem("storage").then(function(value) {
			if (value) {
				console.log(`[FileStorage] Previous storage has been found, now loading it into memory!`);
				Client.storage = new FileStorage(value.data.files)
			} else {
				console.log(`[FileStorage] No previous storage found, creating new storage!`);
				Client.storage = new FileStorage();
				localforage.setItem("storage", Client.storage)
			}
			if (location.href.split("?")[1]) {
				var testPath = location.href.split("?")[1];
				try {
					Client.storage.getFolder(testPath);
					Client.directory = testPath
				} catch (err) {
					Client.directory = "/";
					history.replaceState({}, document.title, location.pathname)
				}
			}
			FrontEnd.update()
		}, function(err) {
			console.log(`[ERROR] ${err}: Cannot read localforage storage!`)
		});
		localforage.getItem("bookmarks").then(function(value) {
			if (value) {
				console.log(`[FileStorage] Previous bookmarks have been found, now loading it into memory!`);
				Client.bookmarks = value
			} else {
				console.log(`[FileStorage] No previous bookmarks found, creating new bookmarks!`);
				Client.bookmarks = ["/"];
				localforage.setItem("bookmarks", Client.bookmarks)
			}
			FrontEnd.update()
		}, function(err) {
			console.log(`[ERROR] ${err}: Cannot read localforage storage!`)
		});
		localforage.getItem("limit").then(function(value) {
			if (value == null)
				Client.limit = !0;
			else Client.limit = value;
			FrontEnd.update()
		}, function(err) {
			console.log(`[ERROR] ${err}: Cannot read localforage storage!`)
		});
		window.addEventListener("message", function(event) {
			if (event.origin != location.origin)
				return;
			FileManager.editFileData(event.source.window.editing, event.data)
		}, !1)
	},
	upload: function(file) {
		if ((Client.size + file.properties.size) >= Client.maxSize && Client.limit) {
			console.log("[ERROR] Cannot upload file, the file would go over the remaining storage quota!");
			Utils.alert("Upload error!", `Sorry, but the file <strong>${file.name}</strong> was unable to be uploaded.<br />Check the <strong>Developer Console</strong> for more information.`, 'error')
		} else if (Client.folder.addFile(file)) {
			FrontEnd.update();
			this.save();
			var modal = Utils.alert("File uploading!", `The file <strong>${file.name}</strong> is being uploaded.<br />Please wait for the confirmation message that it is fully uploaded before leaving the page.`, 'info', 2000).then(function() {
				localforage.getItem("storage").then(function() {
					Utils.alert("File uploaded!", `The file <strong>${file.name}</strong> has finished being uploaded!`, 'success')
				})
			})
		} else Utils.alert("Upload error!", `Sorry, but the file <strong>${file.name}</strong> was unable to be uploaded.<br />Check the <strong>Developer Console</strong> for more information.`, 'error')
	},
	save: function() {
		localforage.setItem("storage", Client.storage);
		localforage.setItem("bookmarks", Client.bookmarks);
		localforage.setItem("limit", Client.limit)
	},
	newFolder: function() {
		Utils.prompt("New Folder", "Please insert name:", "info").then(function(response) {
			if (response.value) {
				var name = response.value.replace(/\//g, '').replace(/\.\./g, '');
				if (!Client.folder.addFile(new StorageFolder(name, Client.directory, []))) {
					Utils.alert("Folder error!", `Sorry, but the folder <strong>${name}</strong> was unable to be created.<br />Check the <strong>Developer Console</strong> for more information.`, 'error')
				}
				FrontEnd.update();
				FileManager.save()
			}
		})
	},
	createFolder: function(path, base = Client.folder) {
		var paths = Utils.parsePath(path);
		var dir = base;
		for (var i = 0; i < paths.length; i++) {
			if (!dir.getObject(paths[i]))
				dir.addFile(new StorageFolder(paths[i], dir.path, []));
			dir = dir.getObject(paths[i]);
		}
		FrontEnd.update();
		FileManager.save();
		return dir;
	},
	clearFiles: function() {
		swal({
			title: 'Are you sure you want to clear all files?',
			html: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: !0,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete everything!'
		}).then((result) => {
			if (result.value) {
				swal('Deleted!', 'Your files have been deleted.', 'success');
				localforage.clear();
				FileManager.load();
				Client.directory = "/";
				FrontEnd.update()
			}
		})
	},
	goFolder: function(counter) {
		var folder = Items[counter];
		if (folder.name == "...")
			this.backFolder();
		else Client.directory += folder.name + "/";
		FrontEnd.update()
	},
	goToFolder: function(path) {
		Client.directory = path;
		FrontEnd.update()
	},
	backFolder: function() {
		var steps = Utils.parsePath(Client.directory);
		steps.pop();
		Client.directory = Utils.stepsToPath(steps);
		FrontEnd.update()
	},
	deleteFile: function(name) {
		Client.folder.removeObject(name);
		FrontEnd.update();
		FileManager.save()
	},
	deleteFolder: function(name) {
		var traverse = function(folder) {
			for (var j = 0; j < Client.bookmarks.length; j++) {
				if (Client.bookmarks[j] == folder.path + folder.name + "/") {
					Client.bookmarks.splice(j, 1)
				}
			}
			var files = folder.files;
			if (!folder.files)
				return;
			for (var i = 0; i < files.length; i++) {
				if (files[i].type == "StorageFile") {
					folder.removeObject(files[i].name)
				} else {
					traverse(files[i])
				}
			}
		}
		traverse(Client.folder.getObject(name));
		this.deleteFile(name)
	},
	toggleBookmark: function() {
		var bookmarked = $("#bookmark_star").hasClass("fas");
		if (bookmarked) {
			$("#bookmark_star").attr("class", "icon-2x far fa-star");
			Client.bookmarks = Client.bookmarks.filter(x => x != Client.directory)
		} else {
			$("#bookmark_star").attr("class", "icon-2x fas fa-star");
			Client.bookmarks.push(Client.directory)
		}
		FrontEnd.update();
		this.save()
	},
	getChecked: function() {
		var checked = [];
		for (var i = 1; i <= Client.fileCounter; i++) {
			if ($(`#file-list-${i}`)[0] && $(`#file-list-${i}`)[0].checked)
				checked.push(Items[i])
		}
		return checked
	},
	newFile: function() {
		Utils.prompt("New file", "Please insert name:", "info").then(function(response) {
			if (response.value) {
				var name = response.value;
				if (!Client.folder.addFile(new StorageFile(name, mime.getType(name), undefined, {
						size: 0,
						date: +new Date()
					}, Client.directory))) {
					Utils.alert("File error!", `Sorry, but the file <strong>${name}</strong> was unable to be created.<br />Check the <strong>Developer Console</strong> for more information.`, 'error')
				}
				FrontEnd.update();
				FileManager.save()
			}
		})
	},
	deleteChecked: function() {
		var checked = this.getChecked();
		if (checked.length == 0) {
			Utils.alert("No selected files!", "You have not selected any files to delete!", "error");
			return
		}
		swal({
			title: 'Are you sure you want to delete the selected files?',
			html: "You won't be able to revert this!",
			type: 'warning',
			showCancelButton: !0,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, delete them!'
		}).then((result) => {
			if (result.value) {
				swal('Deleted!', 'Your files have been deleted.', 'success');
				for (var i = 0; i < checked.length; i++) {
					if (checked[i].type == "StorageFolder") {
						FileManager.deleteFolder(checked[i].name)
					} else FileManager.deleteFile(checked[i].name)
				}
				FrontEnd.update();
				FileManager.save()
			}
		})
	},
	editFile: function() {
		var checked = this.getChecked();
		checked = checked.filter(function(obj) {
			return obj.type !== "StorageFolder"
		});
		if (checked.length == 0) {
			Utils.alert("Invalid selection!", "Sorry, but only files and not folders can be selected for editing.", "warning");
			return
		}
		for (var i = 0; i < checked.length; i++) {
			(function(i) {
				var file = checked[i];
				file.getData().then(function(data) {
					var newTab = window.open();
					newTab.window.editing = file;
					newTab.window.data = data;
					newTab.document.title = `Editing file: ${file.name}`;
					var ace = newTab.document.createElement("script");
					ace.src = location.origin + location.pathname + "ace-builds/src-min-noconflict/ace.js";
					ace.id = "ace_script";
					newTab.fn = function() {
						var editor = newTab.window.ace.edit("edit");
						editor.setTheme("ace/theme/monokai");
						var editing = newTab.window.editing;
						editor.session.setMode(`ace/mode/${(editing.name.split(".")[editing.name.split(".").length-1]).replace(/^js$/, "javascript").replace(/^c$/, "c_cpp")}`);
						if (newTab.window.data) {
							var reader = new FileReader();
							reader.onload = function() {
								editor.setValue(reader.result)
							}
							reader.readAsText(newTab.window.data)
						}
						newTab.window.editor = editor;
					}
					var script = newTab.document.createElement("script");
					script.innerHTML = "document.getElementById('ace_script').onload = fn; function save(){window.opener.postMessage(editor.getValue(), window.opener.location.origin);}";
					newTab.document.body.innerHTML = `<style>\

														body {\

															font-family: sans-serif;\

														}\

            											#edit {\

        													position: absolute;\

         													top: 100;\

        													right: 0;\

         													bottom: 0;\

         													left: 0;\

     													 }\

        											</style>

        											<h1>Editing file: ${file.name}</h1>\

													<button onclick="save();alert('File saved!');">Save File</button>&nbsp;&nbsp;<button onclick="save();window.close()">Save and Close</button>\

													<div id="edit"></div>`;
					newTab.document.body.appendChild(ace);
					newTab.document.body.appendChild(script);
					Client.openEditors.push(newTab)
				})
			}(i))
		}
	},
	editFileData: function(file, data) {
		var blob = new Blob([data], {
			type: file.mime
		});
		localforage.setItem(file.location, blob);
		file.properties = {
			size: (new TextEncoder('utf-8').encode(data)).length,
			date: +new Date()
		}
		FrontEnd.update();
		FileManager.save()
	},
	downloadSelected: function() {
		var checked = this.getChecked();
		if (checked.length == 0) {
			this.downloadFolderZip(Client.folder);
			return;
		}
		for (var i = 0; i < checked.length; i++) {
			if (checked[i].type == "StorageFile")
				Utils.downloadItem(checked[i])
			else
				this.downloadFolderZip(checked[i]);
		}
	},
	downloadFolderZip: function(folderOBJ) {
		var objects = {};
		var traverse = function(files, baseName) {
			for (var i = 0; i < files.length; i++) {
				if (files[i].type == "StorageFile") {
					objects[baseName + files[i].name] = files[i].location;
				} else {
					traverse(files[i].files, baseName + files[i].name + "/");
				}
			}
		}
		traverse(folderOBJ.files, "");

		var zip = new JSZip();
		var objArray = Object.keys(objects);
		var promises = [];
		var names = [];
		var fileName = `${(folderOBJ.name == "/" ? "root" : folderOBJ.name)}.zip`;
		for (var i = 0; i < objArray.length; i++) {
			promises.push(localforage.getItem(objects[objArray[i]]));
			names.push(objArray[i]);
		}
		Promise.all(promises).then(function(data) {
			for (var i = 0; i < data.length; i++)
				zip.file(names[i], data[i]);

			zip.generateAsync({
				type: "blob"
			}).then(function(content) {
				saveAs(content, fileName);
			});
		});
	},
	extractZip: function(file) {
		var zip = new JSZip();
		Utils.prompt("Extract to?", "Where do you want to extract the contents of this zip?", "info", Client.directory + file.name.split(".")[0] + "/").then(response => {
			if (!response.value)
				return;

			var folderName = response.value;
			var dir = FileManager.createFolder(folderName);
			file.getData().then(data => {
				zip.loadAsync(data).then(zipData => {
					var files = zipData.files,
						fileNames = Object.keys(files);
					for (var i = 0; i < fileNames.length; i++) {
						((name) => {
							files[name].async("arraybuffer").then(arrayBuf => {
								var mimeType = mime.getType(name) || "text/plain";
								var blob = new Blob([arrayBuf], {
									'type': mimeType
								});
								if (blob.size == 0)
									return;

								if (name.includes("/")) {
									dir = FileManager.createFolder("/" + name.split("/").slice(0, -1).join("/") + "/", dir);
									name = name.split("/")[name.split("/").length - 1];
								}
								var storedFile = new StorageFile(name, mimeType, blob, {
									size: blob.size,
									date: +new Date()
								}, dir.path);
								dir.addFile(storedFile);
								dir = FileManager.createFolder(folderName);
							});
						})(fileNames[i]);
					}
				});
				FrontEnd.update();
				FileManager.save();
			});
		})
	},
	renameFile: function() {
		var checked = this.getChecked();
		if (checked.length != 1) {
			Utils.alert("Invalid selection!", "Sorry, but only one file or folder can be selected at a time to be renamed.", "warning");
			return
		}
		var file = checked[0];
		var type = file.type == "StorageFile" ? "file" : "folder";
		Utils.prompt(`Rename ${type}:`, `Rename ${type} <strong>${file.name}</strong> to:`, "info", file.name).then(function(newName) {
			if (newName.value) {
				if (file.type == "StorageFolder") {
					for (var j = 0; j < Client.bookmarks.length; j++) {
						if (Client.bookmarks[j] == file.path + checked[i].name + "/") {
							Client.bookmarks[j] = file.path + newName.value + "/"
						}
					}
				}
				file.name = newName.value;
				FrontEnd.update();
				FileManager.save()
			}
		})
	},
	toggleLimit: function() {
		if (Client.limit) {
			swal({
				title: 'Are you sure you want to disable the storage limit?',
				html: "Disabling the storage limit is dangerous because it might lead to data erasure.<br />If you go over the limit, there is a chance that your web browser will clear all of the files stored!",
				type: 'warning',
				showCancelButton: !0,
				confirmButtonColor: '#3085d6',
				cancelButtonColor: '#d33',
				confirmButtonText: 'Yes, remove the limit!'
			}).then((result) => {
				if (result.value) {
					swal('Limit disabled!', 'The limit has been disabled.', 'success');
					Client.limit = !1;
					FrontEnd.update();
					FileManager.save()
				}
			})
		} else {
			Utils.alert("Limit reenabled!", "The storage limit has been reenabled.<br />If you are still over the limit, please delete or clear files to make space.", "success");
			Client.limit = !0;
			FrontEnd.update();
			FileManager.save()
		}
	}
}
var ContextMenu = {
	menu: function(element) {
		var item = Items[parseInt(element.id.replace("file-settings-", ""))];
		var menuPos = $("#menu")[0].getBoundingClientRect();
		var pos = element.getBoundingClientRect();
		var menuStyle = $("#menu")[0].style;
		$("#menu-file").html(item.name);
		$("#menu").attr("counter", element.id.replace("file-settings-", ""));
		menuStyle.top = pos.y + "px";
		menuStyle.left = (pos.x - menuPos.width) + "px";
		menuStyle.visibility = "visible";
		menuStyle.display = "block";
		menuStyle.opacity = "1";
		Client.menuAnim = !0;
		setTimeout(function() {
			Client.menuAnim = !1
		}, 500);
		$("#menu-zip-only")[0].style.display = "none";
		if (item.type == "StorageFile") {
			$("#menu-file-only")[0].style.display = "block";
			$("#menu-file-icon").attr("class", "fa fa-file");
			if (item.name.endsWith(".zip"))
				$("#menu-zip-only")[0].style.display = "block";
		} else {
			$("#menu-file-only")[0].style.display = "none";
			$("#menu-file-icon").attr("class", "fa fa-folder")
		}
	},
	set: function(element) {
		$("#menu")[0].style.opacity = "0";
		FrontEnd.update();
		$(`#file-list-${element.parentElement.getAttribute("counter")}`)[0].checked = "checked"
	}
}
var FrontEnd = {
	resetFiles: function() {
		Client.fileCounter = 2;
		Items[1] = new StorageFolder("...", "/", []);
		$("#files")[0].innerHTML = Template.folder(1, "...");
		$("#folders")[0].innerHTML = Template.sideFolder(1, "...")
	},
	addItem: function(item) {
		Items[Client.fileCounter] = item;
		if (item.type == "StorageFile") {
			$("#files")[0].innerHTML += Template.file(Client.fileCounter++, item.name, Utils.fileToIcon(item), `${Utils.timeSince(item.properties.date)} ago | ${Utils.bytesToSize(item.properties.size)}`)
		} else {
			$("#folders")[0].innerHTML += Template.sideFolder(Client.fileCounter, item.name);
			$("#files")[0].innerHTML += Template.folder(Client.fileCounter++, item.name)
		}
	},
	updateFiles: function() {
		this.resetFiles();
		var files = Client.folder.files;
		for (var i = 0; i < files.length; i++)
			FrontEnd.addItem(files[i]);
	},
	updatePath: function() {
		$("#path").html(`Current path: ${Client.directory}`);
		document.title = `FM: ${Client.directory}`;
		history.replaceState({}, document.title, `?${Client.directory}`)
	},
	updateStats: function() {
		var size = 0;
		var traverse = function(files) {
			for (var i = 0; i < files.length; i++) {
				if (files[i].type == "StorageFile") {
					size += files[i].properties.size
				} else {
					traverse(files[i].files)
				}
			}
		}
		traverse(Client.storage.data.files);
		navigator.webkitTemporaryStorage.queryUsageAndQuota(function(used, granted) {
			Client.size = size;
			if (Client.limit) {
				Client.maxSize = granted;
				$("#sizecounter").html(`<strong>${Utils.bytesToSize(size)}</strong> used out of <strong>${Utils.bytesToSize(Client.maxSize)}</strong>`)
			} else {
				Client.maxSize = 10990000000000;
				$("#sizecounter").html(`<strong>${Utils.bytesToSize(size)}</strong> used out of <strong>unlimited space</strong>`)
			}
		}, )
	},
	updateBookmarks: function() {
		if (!Client.bookmarks)
			return;
		$("#bookmarks")[0].innerHTML = "";
		$("#bookmark_star").attr("class", "icon-2x far fa-star");
		for (var i = 0; i < Client.bookmarks.length; i++) {
			$("#bookmarks")[0].innerHTML += Template.bookmark(Client.bookmarks[i]);
			if (Client.bookmarks[i] == Client.directory)
				$("#bookmark_star").attr("class", "icon-2x fas fa-star")
		}
	},
	update: function() {
		this.updateFiles();
		this.updatePath();
		this.updateStats();
		this.updateBookmarks()
	},
}
var Template = {
	folder: function(counter, name) {
		return `<li id="file-id-${name.replace(" ", "_")}">\

					<div class="file-control">\

						<input id="file-list-${counter}" class="magic-checkbox" type="checkbox">\

						<label for="file-list-${counter}"></label>\

					</div>\

					<div class="file-settings"><a href="javascript:void(0)" onclick="ContextMenu.menu(this);ContextMenu.menu(this);" id="file-settings-${counter}"><i class="fa fa-ellipsis-v"></i></a></div>\

					<div class="file-attach-icon"></div>\

						<a href="javascript:void(0)" onclick="FileManager.goFolder(${counter})" class="file-details">\

							<div class="media-block">\

								<div class="media-left"><i class="fiv-viv fiv-icon-folder"></i></div>\

								<div class="media-body">\

									<p class="file-name single-line">${name}</p>\

								</div>\

							</div>\

						</a>\

				</li>`
	},
	file: function(counter, name, icon, stats) {
		return `<li id="file-id-${name.replace(" ", "_")}">\

					<div class="file-control">\

						<input id="file-list-${counter}" class="magic-checkbox" type="checkbox">\

						<label for="file-list-${counter}"></label>\

					</div>\

					<div class="file-settings"><a href="javascript:void(0)" onclick="ContextMenu.menu(this);ContextMenu.menu(this);" id="file-settings-${counter}"><i class="fa fa-ellipsis-v"></i></a></div>\

					<div class="file-attach-icon"></div>\

					<a href="javascript:void(0)" onclick="Utils.openItemInNewTab(Items[${counter}])" class="file-details">\

						<div class="media-block">\

							<div class="media-left"><i class="fiv-viv fiv-icon-blank fiv-icon-${icon}"></i></div>\

							<div class="media-body">\

								<p class="file-name">${name}</p>\

								<small>${stats}</small>\

							</div>\

						</div>\

					</a>\

				</li>`
	},
	sideFolder: function(counter, name) {
		return `<a href="javascript:void(0)" onclick="FileManager.goFolder(${counter})" class="list-group-item">\

					<i class="fiv-viv fiv-icon-folder icon-lg icon-fw">&nbsp</i>${name}\

				</a>`
	},
	bookmark: function(path) {
		return `<a href="javascript:void(0)" onclick="FileManager.goToFolder('${path}');" class="list-group-item"><i class="fiv-viv fiv-icon-folder icon-lg icon-fw">&nbsp</i>${Utils.parsePath(path)[Utils.parsePath(path).length-1] || "/"}</a>`
	}
}
var HTMLPreview = {
	files: {},
	initialize: function() {
		var promises = [];
		var names = [];
		var traverse = function(files, path = "/") {
			for (var i = 0; i < files.length; i++) {
				if (files[i].type == "StorageFile") {
					(function(item) {
						promises.push(item.getData());
						names.push(path + item.name)
					}(files[i]))
				} else {
					traverse(files[i].files, path + files[i].name + "/")
				}
			}
		}
		traverse(Client.storage.data.files);
		Promise.all(promises).then(function(values) {
			for (var i = 0; i < values.length; i++) {
				HTMLPreview.files[names[i]] = URL.createObjectURL(values[i])
			}
			var checked = FileManager.getChecked();
			if (checked.length == 1 && checked[0].type == "StorageFile" && checked[0].name.includes(".html")) {
				HTMLPreview.render(checked[0].name);
				return
			}
			var html = {};
			for (var i = 0; i < Client.folder.files.length; i++) {
				var item = Client.folder.files[i];
				if (item.type == "StorageFile" && item.name.includes(".html"))
					html[item.name] = item.name
			}
			swal({
				title: 'Select an HTML file',
				type: "info",
				html: 'Select an HTML file to be previewed.<br />This will fix all the paths in the html file and allow for html files to access stored data.',
				input: 'select',
				inputOptions: html,
				inputPlaceholder: 'Select file',
				showCancelButton: !0,
			}).then(function(value) {
				if (value) {
					HTMLPreview.render(value.value)
				}
			})
		})
	},
	fixFilePaths: function(path) {
		var ret = {};
		for (var key in this.files)
			ret[decodeURIComponent(new URI(key).relativeTo(path))] = this.files[key];
		return ret
	},
	render: function(name) {
		var file = Client.folder.getObject(name);
		file.getData().then(function(data) {
			var reader = new FileReader();
			reader.onload = function() {
				var output = reader.result;
				var files = HTMLPreview.fixFilePaths(Client.directory);
				for (var key in files) {
					output = output.replace(new RegExp(key, "g"), files[key])
				}
				var blob = new Blob([output], {
					type: file.mime
				});
				window.open(URL.createObjectURL(blob))
			}
			reader.readAsText(data)
		})
	}
}
$('#f').bind('change', function() {
	var name = $("#f").val().replace("C:\\fakepath\\", "");
	var upload = $("#f")[0].files[0];
	var blob = new Blob([upload], {
		type: upload.type
	}, name);
	var file = new StorageFile(name, upload.type || "text/plain", blob, {
		size: upload.size,
		date: +new Date()
	}, Client.directory);
	FileManager.upload(file)
});
$('#f')[0].onclick = function() {
	this.value = null
};
$(window).on("dragenter", function(e) {
	dropZone.style.visibility = "visible";
	clearTimeout(window.dropZoneTimer);
	window.dropZoneTimer = setTimeout(function() {
		dropZone.style.visibility = "hidden"
	}, 2000)
});
$("#dropZone").on("dragenter", function(e) {
	e.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = 'copy'
});
$("#dropZone").on("dragover", function(e) {
	e.preventDefault();
	e.originalEvent.dataTransfer.dropEffect = 'copy'
});
$("#dropZone").on("dragleave", function(e) {
	dropZone.style.visibility = "hidden"
});
$("#dropZone").on("drop", function(e) {
	e.preventDefault();
	dropZone.style.visibility = "hidden";
	e = e.originalEvent;
	if (e.dataTransfer.files && e.dataTransfer.files[0]) {
		var upload = e.dataTransfer.files[0];
		var blob = new Blob([upload], {
			type: upload.type
		}, upload.name);
		var file = new StorageFile(upload.name, upload.type || "text/plain", blob, {
			size: upload.size,
			date: +new Date()
		}, Client.directory);
		FileManager.upload(file)
	}
});
$(document).click(function() {
	if (!Client.menuAnim) {
		$("#menu")[0].style.opacity = "0"
		$("#menu")[0].style.display = "none";
	}
});
window.onload = function() {
	FileManager.load();
	if ($("#wrapfabtest").height() > 0) {
		console.log('[FileStorage] No AdBlock detected.')
	} else {
		console.log('[FileStorage] AdBlock detected, launching prompt.');
		Utils.alert("AdBlock Detected", "Please disable AdBlock on this page for this application to work correctly.<br /><br />There are no ads on this page, but AdBlock messes with some of the systems used in this application.<br /><br />If AdBlock is left on, there will be issues with the loading and displaying of files when clicked.", "warning")
	}
}
window.onbeforeunload = function() {
	for (var i = 0; i < Client.openEditors.length; i++)
		Client.openEditors[i].close();
}