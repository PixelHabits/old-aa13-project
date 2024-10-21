import { assert } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentSignUp,
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nGet the Current User', () => {
	let agent;
	let newAgent;
	let xsrfToken;
	let xsrfToken2;
	let agentDetails;

	before(async function () {
		this.timeout(10000);
		[agent, newAgent] = createManyAgents(apiBaseUrl, 2);
		[xsrfToken, xsrfToken2] = await fetchManyCsrfTokens([agent, newAgent]);
		const res = await agentSignUp(agent, xsrfToken);
		agentDetails = res.body.user;
	});

	describe('GET /api/session', () => {
		it('Correct Endpoint', (done) => {
			newAgent
				.get('/session')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});

	describe('Successful Response when there is a logged in user', () => {
		it('Status Code - 200', (done) => {
			newAgent
				.get('/session')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect(200)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.post('/session')
				.send({ credential: agentDetails.email, password: 'secret password' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					if (err) return done(err);

					const expected = {
						email: { value: agentDetails.email, type: 'string' },
						username: { value: agentDetails.username, type: 'string' },
						firstName: { value: agentDetails.firstName, type: 'string' },
						lastName: { value: agentDetails.lastName, type: 'string' },
						id: { value: agentDetails.id, type: 'number' },
					};

					for (const field of Object.keys(expected)) {
						assert.strictEqual(
							res.body.user[field],
							expected[field].value,
							`${field} does not match`,
						);
						assert.strictEqual(
							typeof res.body.user[field],
							expected[field].type,
							`Type of ${field} not as expected`,
						);
					}
					done();
				});
		});
	});

	describe('Successful Response when there is no logged in user', () => {
		it('Status Code - 200', (done) => {
			newAgent
				.get('/session')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(200)
				.expect('Content-Type', /json/)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			newAgent
				.get('/session')
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect('Content-Type', /json/)
				.expect((response) => {
					if (!('user' in response.body)) throw new Error('Missing key user');
					if (response.body.user !== null)
						throw new Error('Missing key in response');
				})
				.end((err, res) => {
					if (err) return done(err);
					assert.strictEqual(res.body.user, null);
					done();
				});
		});
	});
});
