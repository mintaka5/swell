import React, {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {
  Container, Row, Col, Button, Card, Table, Image,
  Spinner, Tab, Nav, Tabs, Form
} from 'react-bootstrap';
import {JSONPath} from 'jsonpath-plus';
import axios from 'axios';
import util from 'util';
//import moment from 'moment';

//import 'regenerator-runtime';

const WxWidget = () => {
  const stationUrl = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json';
  const coopUrl = '';
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState();
  const [stations, setStations] = useState([]);

  function toggle() {
    setIsActive(!isActive);
  }

  function reset() {
    setSeconds(0);
    setIsActive(false);
  }

  const lastOfValues = (a) => {
    return a[a.length-1];
  }

  const getLocation = async () => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation(position.coords);
    });
  }

  const findStation = async () => {
    if(location) {
      await axios.get(stationUrl).then((res) => {
        let radius = 0.00005;
        let l1 = [location.latitude-radius, location.longitude-radius];
        let l2 = [location.latitude+radius, location.longitude+radius];
        let jpath = util.format(
          "$.stations[?((@.lat>=%d || @.lat<=%d) && (@.lng>=%d || @.lng<=%d))]",
          l1[0], l1[1],
          l2[0], l2[1]
        );

        let stns = JSONPath({
          path: jpath,
          json: res.data
        });
        setStations(stns)


      }).catch(err => console.log(err));
    }

    return false;
  }

  useEffect(() => {
    let interval = null;

    if(isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds+1);
        getLocation();
      }, 1000);
    } else if(!isActive && seconds !== 0) {
      clearInterval(interval);
    }

    findStation();

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  return (
    <div>
      <div>Elapsed time: {seconds}s</div>
      {location &&
        <code>{location.latitude}, {location.longitude}</code>
      }
      {!location &&
        <code>waiting</code>
      }
      {stations.length > 0 &&
        <Table striped border>
          
        </Table>
      }
      <div><Button onClick={toggle}>Boop!</Button></div>
    </div>
  );
};

class Main extends React.Component {
  render() {
    return (
        <Container>
          <Row>
            <Col lg={4}>
              <WxWidget />
            </Col>
          </Row>
        </Container>
    );
  }
}

ReactDOM.render(<Main />, document.getElementById("app"));
