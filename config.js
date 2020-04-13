const MONGO_OPTIONS = {
    url: 'mongodb://localhost:27017/craw_vnexpress',
    db_options: {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
}
module.exports=MONGO_OPTIONS