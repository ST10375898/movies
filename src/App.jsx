import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Search from './components/Search'
import { Spinner } from "flowbite-react";
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5NjJjYTUxZDM0YmI2Y2YyZGRiZWRkZjMyYzE5MDExMCIsIm5iZiI6MTc1MTM2OTcwMy41MjQsInN1YiI6IjY4NjNjN2U3M2ZmYjlmMjc4NzJiZTIzYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.JxHsz8KeSeVHhCAgZR29C7IpJy35cmyy2Xv1rQFe78A"

const API_OPTIONS ={
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization:`Bearer ${API_KEY}`

  }
}
function App() {
  
  const [searchTerm,setSearchTerm] = useState('')
  const [error,setError] = useState('')

  const [movieList,setMovieList] = useState([])
  const [isLoading,setIsLoading] = useState(false)

  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('')
  const [trendingMovies,setTrendingMovies] = useState([])
  

  useDebounce( () => setDebouncedSearchTerm(searchTerm),500, 
  [searchTerm])

  const fetchMovies = async (query = '') =>{
    setIsLoading(true)
    setError('')
    try{
      
      const endpoint = query ?
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
     : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
      const response = await fetch(endpoint,API_OPTIONS)
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }else{
        const data = await response.json()
        

        if(data.Response === 'False'){
          setError(data.Error || 'Failed to fetch movies')
          setMovieList([])
          return
        }
        setMovieList(data.results || [])

        if(query && data.results.length > 0){
          await updateSearchCount(query,data.results[0])
        }
      }
    }catch(error)
    {
      console.error(`Error fetching movies: ${error}`)
      setError(`Error setting movies. Please try again later ${error}`)
    }finally{
      setIsLoading(false)
    }
  }

  const loadTrendingMovies = async () =>{
    try {
      const movies = await getTrendingMovies()
      setTrendingMovies(movies)
    } catch (error) {
      console.log(`Error fetching movies: ${error}`)
      
    }
  }

  useEffect( () =>{
    fetchMovies(debouncedSearchTerm)
  },[debouncedSearchTerm])

  useEffect(() =>{
    loadTrendingMovies()
  },[])
  return (
    <>
      <main>
        <div className='pattern'/>
        <div className='wrapper'>
          <header>
            <img src='./hero.png' alt='hero banner'/>
            <h1 >Find <span className='text-gradient'>Movies</span>
             You'll Enjoy Without the Hassle</h1>

             <Search
                searchTerm = {searchTerm}
                setSearchTerm = {setSearchTerm}
              />
          </header>

          {trendingMovies.length > 0 && (
            <section className='trending'>
                <h2>Trending Movies</h2>

                <ul>
                  {trendingMovies.map((movie,index) =>(
                    <li key={movie.$id}>
                      <p>{index + 1}</p>
                      <img src={movie.poster_url ? `${movie.poster_url}` :
                      '/No-Poster.png'} alt={movie.title}/>
                    </li>
                  ))}
                </ul>
            </section>
          )}

          <section className='all-movies'>
            <h2>All Movies</h2>

            {isLoading ? (
              <Spinner aria-label="Large spinner example" size="xl" />
            ):error? (
              <p className='text-red-500'>{error}</p>
            ):(
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie = {movie}/>
                ))}
              </ul>
            )}



            
          </section>
          
          </div>
          
      </main>
    </>
  )
}

export default App
