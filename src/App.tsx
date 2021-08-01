import React, { useState, SyntheticEvent, useEffect } from 'react'
import './styles/index.css'
import './styles/reset.css'

function App() {

  type Breweries = {
    brewery_type : string,
    name: string,
    city: string,
    street: string,
    postal_code: string,
    phone: string,
    website_url: string,
    id: number
  }[]

  type BreweryCities = string[]

  const [breweries, setBreweries] = useState<Breweries>([])
  const [breweryType, setBreweryType] = useState("")
  const [breweryCity, setBreweryCity] = useState<BreweryCities>([])
  const [searchInfo, setSearchInfo] = useState("")
  const [currentState, setCurrentState] = useState("")
  const [breweriesToShow, setBreweriesToShow] = useState<Breweries>([])

  const cityList = [...new Set (breweries.map( brewery => brewery.city ))].sort()

  useEffect( () => {
    let filteredArray = [...breweries]
    if (breweryType) filteredArray = [...filteredArray.filter( brewery => brewery.brewery_type === breweryType )]  
    if (breweryCity.length) filteredArray = [...filteredArray.filter( brewery => breweryCity.includes(brewery.city) )]
    if (searchInfo) filteredArray = [...filteredArray.filter( brewery => brewery.name.toUpperCase().includes(searchInfo.toUpperCase()) )]
    if (!breweryType && !breweryCity.length && !searchInfo) filteredArray = [...breweries]

    setBreweriesToShow(filteredArray)
  }, [breweryType, breweryCity, searchInfo] )

  function fetchBreweriesForState (USState : string) {
    fetch(`https://api.openbrewerydb.org/breweries?by_state=${USState}&per_page=50`)
      .then(function (response) { 
        return response.json()
      })
      .then(function (breweries : Breweries) {
        const filteredBreweryList = breweries.filter( newBreweries => newBreweries.brewery_type=== "regional" || newBreweries.brewery_type=== "micro"|| newBreweries.brewery_type=== "brewpub")
        setBreweries(filteredBreweryList)
        setBreweriesToShow(filteredBreweryList)
      });
  }

  function handleStateSubmit(e : SyntheticEvent ) {
    const { "select-state" : state } = e.target as HTMLFormElement
    e.preventDefault()
    setCurrentState(state.value)
    fetchBreweriesForState(state.value)
  }

  function handleNameChange(e : SyntheticEvent ) {
    const input = e.target as HTMLInputElement
    setSearchInfo(input.value)
  }

  function handleTypeClick(e : SyntheticEvent) {
    const option = e.target as HTMLOptionElement
    const select = option.parentNode as HTMLSelectElement
    setBreweryType(select.value)
  }

  function handleCityClick(e :SyntheticEvent) {
    const checkbox = e.target as HTMLInputElement
    if (checkbox.checked) {
      setBreweryCity([...breweryCity, checkbox.value])
    } else {
      setBreweryCity(breweryCity.filter( city => city !== checkbox.value))
    }
  }

  function handleClearClick(e : SyntheticEvent) {
    let checkboxes = document.querySelectorAll("input")
    checkboxes : [] = [...checkboxes] as HTMLInputElement[]
    for (const checkbox of checkboxes) {
      checkbox.checked = false
    }
    
    setBreweryCity([])
  }

  return (
    <>
      <header className = "main-header">
        <section className = "select-state-section">
          <h2>Welcome to Brewery Tours</h2>
          <form onSubmit = {handleStateSubmit} id = "select-state-form" autoComplete = "off">
            <label htmlFor="select-state">Which State are you visiting?</label>
            <input id="select-state" name = "select-state" type="text" />
          </form>
        </section>
      </header>
      <main className = "list-results">
      { breweries.length || breweryType || breweryCity.length || searchInfo || currentState || breweriesToShow.length ? <>
        <h1 className="results-heading">List of Breweries</h1>
        <header className="search-bar">
          <form id = "search-breweries-form" autoComplete = "off">
            <label htmlFor = "search-breweries">
              <h2>Search Breweries :</h2>
            </label>
            <input onChange = {handleNameChange} id = "search-breweries" name = "search-breweries" type = "text"></input>
          </form>
        </header>
        <aside className = "filters-section">
          <h2>Filter By: </h2>
          <form id="filter-by-type-form" autoComplete="off">
            <label htmlFor="filter-by-type">
              <h3>Type of Brewery</h3>
            </label>
            <select name="filter-by-type" id="filter-by-type">
              <option onClick = {handleTypeClick} value="">Select a type...</option>
              <option onClick = {handleTypeClick} value="micro">Micro</option>
              <option onClick = {handleTypeClick} value="regional">Regional</option>
              <option onClick = {handleTypeClick} value="brewpub">Brewpub</option>
            </select>
          </form>
          <div className = "filter-by-city-heading">
            <h3>Cities</h3>
            <button onClick = {handleClearClick} className = "clear-all-btn">clear all</button>
          </div>
          <form id = "filter-by-city-form">
            <ul className = "filter-by-city-list">
            {breweries.length ? cityList.map( (city, key) => <li key = {key}>
              <input onClick={handleCityClick} type="checkbox" name={city} value={city} />
              <label htmlFor={city}>{city}</label>
            </li>) : null}
            </ul>
          </form>
        </aside>
        </> : null}
        <article>
          <ul className="breweries-list">
            {
              breweriesToShow.map( brewery => <li key = {brewery.id}>
                <h2>{brewery.name}</h2>
                <div className="type">{brewery.brewery_type}</div>
                <section className = "address">
                  <h3>Address: </h3>
                  <p>{brewery.street}</p>
                  <p>
                    <strong>{brewery.city}, {brewery.postal_code}</strong>
                  </p>
                </section>
                <section className = "phone">
                  <h3>Phone: </h3>
                  <p>{brewery.phone}</p>
                </section>
                <section className = "link">
                  <a href={brewery.website_url} target="_blank">Visit Website</a>
                </section>
              </li>)
            }
          </ul>
        </article>
      </main>
    </>
  )
}

export default App
