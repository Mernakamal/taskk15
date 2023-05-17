
const mongoose = require ('mongoose')
const validator = require ('validator')
const bcryptjs = require ('bcryptjs')
const jwt = require ('jsonwebtoken')

const userSchema = new mongoose.Schema ( {
    username : {
        type: String,
        required : true,
        trim : true
    },
    password : {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value){
            let password = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if(!password.test(value)){
                throw new Error("Pass must include uppercase ")
            }
        }

    },
    email : {
        type: String,
        required: true,
        trim: true,
        lowercase : true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error ('wrong email')
            }
        }
    },
    age : {
        type: Number,
        default: 18,
        validate(val){
            if (val <= 0){
                throw new Error ('age must positive ')
            }
        }
    },
    city: {
        type:String
    },
    tokens : [
        {
            type: String,
            required : true
        }
    ]
})

userSchema.pre ("save" , async function ()  {
       const user = this 

       if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 10)
       }
})


userSchema.statics.findByCredentials = async (em,pass) =>{
  
    const user = await User.findOne({email:em})
    if(!user){
        throw new Error('Unableeeeee to login')
    }
   
    const isMatch = await bcryptjs.compare(pass,user.password)
  
    if(!isMatch){
        throw new Error('Unableee to login')
    }
    return user
}


  userSchema.methods.generateToken = async function () {
     const user = this 
     const token = jwt.sign ({_id:user._id.toString() } , "islam500")
     user.tokens = user.tokens.concat(token)
     await user.save()
     return token
  }



  userSchema.methods.toJSON = function (){
      const user = this 

      const userObject = user.toObject()

      delete userObject.password
      delete userObject.tokens

      return userObject 
  }



const User = mongoose.model( 'User' , userSchema  )


module.exports = User