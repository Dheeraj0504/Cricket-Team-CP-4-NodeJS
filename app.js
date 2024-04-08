const express = require('express');
const path = require('path');

const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const databasePath = path.join(__dirname, 'cricketTeam.db');
const app = express();
app.use(express.json());

let database = null;

const initilizeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
};
initilizeDbAndServer();

//API 1: Returns a list of all players in the team
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
};

app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT 
      *
    FROM 
      cricket_team;
  `;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  );
});

//API 2: Creates a new player in the team (database).
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const createPlayerQuery = `
    INSERT INTO
      cricket_team (player_name, jersey_number, role)
    VALUES 
      (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
      );
  `;
  const player = await database.run(createPlayerQuery);
  //console.log(player);
  response.send('Player Added to Team');
});

//API 3: Returns a player based on a player ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT 
      * 
    FROM 
      cricket_team 
    WHERE 
      player_id = ${playerId};
  `;
  const player = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//API 4:Updates the details of a player in the team (database) based on the player ID
app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body;
  const {playerId} = request.params;
  // console.log(playerId);
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE 
      player_id = ${playerId};
  `;
  await database.run(updatePlayerQuery);
  response.send('Player Details Updated');
});

//API 5:Deletes a player from the team (database) based on the player ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  //console.log(playerId);
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};
  `;
  await database.run(deletePlayerQuery);
  response.send('Player Removed');
});

module.exports = app;
