const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = multer({

	storage: new multer.diskStorage({
        
        destination: path.resolve(__dirname, '..','..','uploads'),
        
        filename: function(req, file, cb){
            
        	crypto.randomBytes(16, (err,hash)=> {

        		if(err) {
        			cb(err);
        		}

        		file.key = `${hash.toString('hex')}-${file.originalname}`;

            	cb(null, file.key);

        	});
        
        }
        
    })

});