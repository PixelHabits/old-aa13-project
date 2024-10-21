import { assert, expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	agentSignUp,
	createAgent,
	fetchCsrfToken,
} from '../utils/agent-factory.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nLog In a User', () => {
	let agent;
	let xsrfToken;
	let agentDetails;

	before(async function () {
		this.timeout(10000);
		agent = createAgent(apiBaseUrl);
		xsrfToken = await fetchCsrfToken(agent);
		const res = await agentSignUp(agent, xsrfToken);
		agentDetails = res.body.user;
	});

	describe('POST /api/session', () => {
		it('Correct Endpoint', (done) => {
			agent
				.post('/session')
				.send({ credential: agentDetails.email, password: 'secret password' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 200', (done) => {
			agent
				.post('/session')
				.send({ credential: agentDetails.email, password: 'secret password' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
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
				.expect((response) => {
					if (!('user' in response.body))
						throw new Error('Missing key in response');
					if (!('firstName' in response.body.user))
						throw new Error('Missing key in response');
					if (!('email' in response.body.user))
						throw new Error('Missing key in response');
				})

				.end((err, res) => {
					if (err) return done(err);
					const expected = {
						email: { value: agentDetails.email, type: 'string' },
						username: { value: agentDetails.username, type: 'string' },
						firstName: { value: agentDetails.firstName, type: 'string' },
						lastName: { value: agentDetails.lastName, type: 'string' },
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
					assert.strictEqual(typeof res.body.user.id, 'number');
					done();
				});
		});
	});

	describe('Error Response: Invalid credentials', () => {
		it('Status Code - 401', (done) => {
			agent
				.post('/session')
				.send({ credential: agentDetails.email, password: 'no' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(401)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.post('/session')
				.send({ credential: agentDetails.email, password: 'no' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					if (err) return done(err);
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message');

					expect(res.body.message).to.equal('Invalid credentials');
					done();
				});
		});
	});

	describe('Error Response: Body validation errors', () => {
		it('Status Code - 400', (done) => {
			agent
				.post('/session')
				.send({ credential: '', password: '' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(400)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent
				.post('/session')
				.send({ credential: '', password: '' })
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					if (err) return done(err);
					expect(err).to.not.exist;
					expect(res.body).to.have.property('message');
					expect(res.body.message).to.equal('Bad Request');
					done();
				});
		});
	});
});
