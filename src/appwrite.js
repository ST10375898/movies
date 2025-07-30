import { Client, Databases, ID, Query, } from "appwrite"

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
const COLLECTION_ID= import.meta.env.VITE_APPWRITE_COLLECTION_ID
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID


const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const databse = new Databases(client)
export const updateSearchCount = async (searchTerm,movie) =>{
    //1Checks if a search term already exists in the database
    //2. If it exists .. count is incremented

    try{
        const result = await databse.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.equal('searchTerm',searchTerm)
        ])
        if(result.documents.length > 0){
            const doc = result.documents[0]
            await databse.updateDocument(DATABASE_ID,COLLECTION_ID,doc.$id,{
                count: doc.count + 1
            })
        }else{
            await databse.createDocument(DATABASE_ID,COLLECTION_ID,ID.unique(),{
                searchTerm,
                count:1,
                movie_id:movie.id,
                poster_url:`https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            })
        }
    }catch(error){

    }

}

export const getTrendingMovies= async () =>{
    try {
        const result = await databse.listDocuments(DATABASE_ID,COLLECTION_ID,[
            Query.limit(5),
            Query.orderDesc('count')
        ])
        return result.documents
    } catch (error) {
       console.error(error) 
    }
}