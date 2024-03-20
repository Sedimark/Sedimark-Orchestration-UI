import logo from './logo.svg';
import './App.css';
import { useEffect } from 'react';
import DataProcessing from './components/DataProcessing/DataProcessing.js';
import { fetchCredentials } from './utils/fetchOauthTokenMage.js';
import {setMageAIOauthToken} from "./reducers/nodeSlice";
import { useDispatch } from 'react-redux';


function App() {

  const dispatch = useDispatch();
  const setFetchedToken = async()=>{
    let fetchedOauthToken;
    try{
      fetchedOauthToken = await fetchCredentials();
      dispatch(setMageAIOauthToken(fetchedOauthToken));
    } catch(err){
      console.log(err);
    }    
  }
 
  useEffect(()=>{
    setFetchedToken();
  },[]);

  return (
    <div className="App">
      <DataProcessing/>
    </div>
  );
}

export default App;
