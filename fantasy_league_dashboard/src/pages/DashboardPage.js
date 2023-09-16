import {
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as React from "react";
import axios from "axios";
import { useState } from "react";

const columns = [
  { field: "id", headerName: "ID", flex: 1 },
  { field: "name", headerName: "Name", flex: 1 },
  { field: "price", headerName: "Price", flex: 1 },
  { field: "team", headerName: "Team", flex: 1 },
  { field: "position", headerName: "Position", flex: 1 },
  {
    field: "timesSelected",
    headerName: "Times Selected",

    flex: 1,
  },
  { field: "injuredStatus", headerName: "Injured", flex: 1 },
  { field: "expelledStatus", headerName: "Expelled", flex: 1 },
  { field: "missingStatus", headerName: "Missing", flex: 1 },
  {
    field: "imagePath",
    headerName: "Image",
    editable: true,

    flex: 1,
    renderCell: (params) => <img style={{ height: 50 }} src={params.value} />, // renderCell will render the component
  },
];

function DashboardPage() {
  const [rows, setRows] = useState([]); // rows is the state variable, setRows is the function to update the state variable
  const [players, setPlayers] = useState([]);
  const [defence, setDefence] = useState([]);
  const [midfield, setMidfield] = useState([]);
  const [attack, setAttack] = useState([]);
  const [goalkeeper, setGoalkeeper] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  React.useEffect(() => {
    fetchData();
  }, []);
  const fetchTeamsAndPlayers = async () => {
    let teamsAndPlayers = [];
    const apiUrl =
      "https://dreamteam.sport5.co.il/api/Players/GetTeamsAndPlayers?seasonId=2";
    await axios
      .get(apiUrl)
      .then((response) => {
        // Handle the successful response here
        console.log("Response data:", response.data);
        teamsAndPlayers = response.data;
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error("Request error:", error);
      });
    return teamsAndPlayers;
  };
  const fetchData = async () => {
    setLoading(true);
    setLoadingProgress(0);
    const allPlayers = await fetchTeamsAndPlayers();
    console.log("allPlayers", allPlayers);
    let tempPlayers = [];
    let i = 0;
    for (const team of allPlayers.data) {
      for (const player of team.players) {
        i++;
        setLoadingProgress(i / 900);

        const apiUrl =
          "https://dreamteam.sport5.co.il/api/Players/GetPlayerData?seasonId=2&playerId=" +
          player.id;
        await axios
          .get(apiUrl)
          .then((response) => {
            // Handle the successful response here
            console.log("Response data:", response.data);
            tempPlayers.push({
              ...response.data.data.player,
              ...{
                timesSelected: response.data.data.timesSelected,
                team: team.name,
              },
            });
          })
          .catch((error) => {
            // Handle any errors that occurred during the request
            console.error("Request error:", error);
          });
      }
    }
    await console.log("tempPlayers", tempPlayers);
    await setPlayers(tempPlayers);
    await setDefence(tempPlayers.filter((player) => player.position === 2));
    await setMidfield(tempPlayers.filter((player) => player.position === 3));
    await setAttack(tempPlayers.filter((player) => player.position === 4));
    await setGoalkeeper(tempPlayers.filter((player) => player.position === 1));
    await setRows(tempPlayers);
    await setLoading(false);
  };
  return (
    <Box>
      {!loading ? (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <Button onClick={fetchData}>Reload data</Button>
            <Button
              onClick={() => {
                setRows(players);
              }}
            >
              All positions
            </Button>
            <Button
              onClick={() => {
                setRows(goalkeeper);
              }}
            >
              Goalkeeper - 1
            </Button>
            <Button
              onClick={() => {
                setRows(defence);
              }}
            >
              Defence - 2
            </Button>
            <Button
              onClick={() => {
                setRows(midfield);
              }}
            >
              Midfield - 3
            </Button>
            <Button
              onClick={() => {
                setRows(attack);
              }}
            >
              Attack - 4
            </Button>
          </Box>
          <DataGrid
            sx={{
              width: "100%",
            }}
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 100 },
              },
            }}
            pageSizeOptions={[50, 100]}
            checkboxSelection
          />
        </Box>
      ) : (
        <Box
          sx={{
            marginTop: "25%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
}
export default DashboardPage;
