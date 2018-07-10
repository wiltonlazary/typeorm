import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src";
import {assert} from "chai";
import {User} from "./entity/User";
import {TournamentUserParticipant} from "./entity/TournamentUserParticipant";
import {TournamentSquadParticipant} from "./entity/TournamentSquadParticipant";

describe("github issues > #1972 STI problem - empty columns", () => {
    let connections: Connection[];

    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
    }));
    
    beforeEach(() => reloadTestingDatabases(connections));

    after(() => closeTestingConnections(connections));

    it("should insert with userId", () => Promise.all(connections.map(async connection => {
        // create user
        const user = new User({
            name: "test",
        });
        await connection.manager.save(user);

        // create user participant
        const tournamentUserParticipant = new TournamentUserParticipant({
            user,
        });
        console.log(tournamentUserParticipant);
        await connection.manager.save(tournamentUserParticipant);

        // find user participant in the DB
        const result = await connection.manager.findOne(TournamentUserParticipant);
        console.log(result);

        if (result) {
            assert(result.user instanceof User);
        }
    })));

    it("should insert with ownerId", () => Promise.all(connections.map(async connection => {
        // create user
        const user = new User({
            name: "test",
        });
        await connection.manager.save(user);

        // create tournament squad participant
        const tournamentSquadParticipant = new TournamentSquadParticipant({
            users: [ user ],
            owner: user,
        });
        await connection.manager.save(tournamentSquadParticipant);

        // find squad participant in the DB
        const result = await connection.manager.findOne(TournamentSquadParticipant);

        if (result) {
            assert(result.owner instanceof User);
        }
    })));
});
