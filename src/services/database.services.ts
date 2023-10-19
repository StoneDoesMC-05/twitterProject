import { Db, MongoClient, ServerApiVersion, Collection } from 'mongodb'
import { config } from 'dotenv'
import Users from '~/models/schemas/User.schema'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@tweetproject.1raaeb4.mongodb.net/?retryWrites=true&w=majority`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }
  get user(): Collection<Users> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
}
const databaseService = new DatabaseService()
export default databaseService
