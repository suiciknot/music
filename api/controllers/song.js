const fs = require('fs');
const path = require('path');
const mongoosePaginate = require('mongoose-pagination');

let Artist = require('../models/artist');
let Album = require('../models/album');
let Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;
    
    Song.findById(songId).populate({ path: 'album' }).exec(function(err, song){
        if (err){
            res.status(500).send({ message: "Error en la peticion" });
        }else{
            if(!song){
                res.status(404).send({ message: "Cancion no existe" });
            }else{
                res.status(200).send({ message: song });
            }
        }
    });
}

function saveSong(req, res) {
    var song = new Song();
    
    var params = req.body;
    
    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;
    
    song.save(function(err, songStored){
        if(err){
            res.status(500).send({ message: "Error en el servidor" });
        }else{
            if(!songStored){
                res.status(404).send({ message: "No se ha guardado la cancion" });
            }else{
                res.status(200).send({ message: songStored });
            }
        }
    });
}

function getSongs(req, res){
    var albumId = req.params.album;
    
    if(!albumId){
        var find = Song.find({}).sort('number');
    }else{
        var find = Song.find({albumId}).sort('number');
    }
    
    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function(err, songs){
        if (err) {
            res.status(500).send({ message: "Error en la peticion" });
        }else{
            if(!songs){
                res.status(404).send({ message: "No hay canciones" });
            }else{
                res.status(200).send({songs});
            }
        }
    });
}

function updateSong(req, res){
    var songId = req.params.id;
    var update = req.body;
    
    Song.findByIdAndUpdate(songId, update, function(err, songUpdated){
        if (err) {
            res.status(500).send({ message: "Error en la peticion" });
        }else{
            if(!songUpdated){
                res.status(404).send({ message: "No se ha actualizado la cancion" });
            }else{
                res.status(200).send({song: songUpdated});
            }
        }
    });
}

function deleteSong(req, res){
    var songId = req.params.id;
    
    Song.findByIdAndRemove(songId, function(err, songRemoved){
        if (err) {
            res.status(500).send({ message: "Error en la peticion" });
        }else{
            if(!songRemoved){
                res.status(404).send({ message: "No se ha borrado la cancion" });
            }else{
                res.status(200).send({song: songRemoved});
            }
        }
    });
}

function uploadFile(req, res) {
    let songId = req.params.id;
    let file_name = 'No subido';

    if (req.files){
        let file_path = req.files.file.path;
        let file_split = file_path.split('\\');
        let file_name = file_split[2];

        let ext_split = file_name.split('\.');
        let file_ext = ext_split[1];

        if (file_ext == 'mp3' || file_ext == 'ogg'){
            Song.findByIdAndUpdate(songId, {file: file_name}, function (err, songUpdated) {
                if (!songUpdated){
                    res.status(404).send({ message: 'No se ha podido actualizar el album' });
                }else {
                res.status(200).send({ song: songUpdated });
                }
            });
        }else {
            res.status(200).send({ message: 'Extension del archivo no valida' });
        }
    }else {
        res.status(200).send({ message: 'No has subido el fichero de audio' });
    }
}

function getSongFile(req, res) {
    let imageFile = req.params.songFile;
    let path_file = './uploads/songs/'+imageFile;

    fs.exists(path_file, function(exists){
        if (exists){
            res.sendFile(path.resolve(path_file));
        }else {
            res.status(200).send({ message: 'No existe el fichero de audio' });
        }
    });
}

module.exports = {
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
};


