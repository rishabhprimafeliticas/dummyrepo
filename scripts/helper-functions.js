
// 0123456789abcdefghijklmnopqrstuvwxyz
var crypto = require('crypto');

module.exports = {
    /**
     * 
     * @param {*} length Pass a digit, length of random string.
     * @param {*} chars Pass characters, from which you want string generated.
     * @param {*} callback callback.
     * @returns Returns a random string.
     */
    randomString: function (length, chars, callback) {
        var result = "";
        for (var i = length; i > 0; --i)
            result += chars[Math.round(Math.random() * (chars.length - 1))];
        return callback(result);
    },

    isDateInArray(needle, haystack) {
        // console.log("needle", needle)

        for (var i = 0; i < haystack.length; i++) {
            var dd = String(needle.getDate()).padStart(2, '0');
            var mm = String(needle.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = needle.getFullYear();
            var need = new Date(mm + '/' + dd + '/' + yyyy);

            dd = String(haystack[i].getDate()).padStart(2, '0');
            mm = String(haystack[i].getMonth() + 1).padStart(2, '0'); //January is 0!
            yyyy = haystack[i].getFullYear();
            var hays = new Date(mm + '/' + dd + '/' + yyyy);


            if (need.getTime() === hays.getTime()) {
                return true;
            }
        }
        return false;
    },

    makeid(length) {
        var result = '';
        var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    },

    encryptAddress(textId, type) {
        var mysalt = process.env.MYSALT;
        const key = crypto.createHash('sha256').update(String(mysalt)).digest('base64');
        const key_in_bytes = Buffer.from(key, 'base64')

        var algorithm = 'aes-256-ctr';
        const iv = new Buffer.from(process.env.IV);

        if (type == 'encrypt') {
            var cipher = crypto.createCipheriv(algorithm, key_in_bytes, iv);
            var crypted = cipher.update(JSON.stringify(textId), 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
        }
        else {
            var decipher = crypto.createDecipheriv(algorithm, key_in_bytes, iv)
            var dec = decipher.update(textId, 'hex', 'utf8');
            console.log("dec",dec)
            dec += decipher.final('utf8');
            console.log("dec",dec)

            return dec;
        }
    }

}