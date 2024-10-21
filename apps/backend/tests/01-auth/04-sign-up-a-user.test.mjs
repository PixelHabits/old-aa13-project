import { assert, expect } from 'chai';
import { before, describe, it } from 'mocha';
import {
	createManyAgents,
	fetchManyCsrfTokens,
} from '../utils/agent-factory.mjs';
import {
	createUniqueUser,
	generateUniqueUsername,
} from '../utils/agent-helpers.mjs';
import { apiBaseUrl } from '../utils/constants.mjs';

describe('\nSign Up a User', () => {
	let agent;
	let xsrfToken;
	let agent2;
	let xsrfToken2;
	let agent3;
	let xsrfToken3;
	let agent4;
	let xsrfToken4;
	let userObj;
	let userObj2;

	before(async function () {
		this.timeout(10000);
		userObj = createUniqueUser();
		userObj2 = createUniqueUser();
		[agent, agent2, agent3, agent4] = createManyAgents(apiBaseUrl, 4);
		[xsrfToken, xsrfToken2, xsrfToken3, xsrfToken4] = await fetchManyCsrfTokens(
			[agent, agent2, agent3, agent4],
		);
	});

	describe('POST /api/users', () => {
		it('Correct Endpoint', (done) => {
			agent
				.post('/users')
				.send(userObj)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});
	});

	describe('Response', () => {
		it('Status Code - 201', (done) => {
			agent2
				.post('/users')
				.send(createUniqueUser())
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken2)
				.expect(201)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			agent3
				.post('/users')
				.send(userObj2)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken3)
				.end((err, res) => {
					if (err) return done(err);

					const expected = {
						email: { value: userObj2.email, type: 'string' },
						username: { value: userObj2.username, type: 'string' },
						firstName: { value: userObj2.firstName, type: 'string' },
						lastName: { value: userObj2.lastName, type: 'string' },
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

	describe('Error response: User already exists with the specified email or username', () => {
		it('Status Code - 500', (done) => {
			const userClone = { ...userObj };
			userClone.username = generateUniqueUsername();
			agent
				.post('/users')
				.send(userClone)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.expect(500)
				.end((err, _res) => {
					if (err) return done(err);

					done();
				});
		});

		it('Error response: User already exists with the specified email', (done) => {
			const userClone = { ...userObj };
			userClone.username = generateUniqueUsername();
			agent
				.post('/users')
				.send(userClone)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					if (err) return done(err);
					assert.strictEqual(typeof res.body.errors.email, 'string');

					done();
				});
		});

		it('Error response: User already exists with the specified username', (done) => {
			const userClone = { ...userObj };
			userClone.email = `${generateUniqueUsername()}@test.com`;
			agent
				.post('/users')
				.send(userClone)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken)
				.end((err, res) => {
					if (err) return done(err);
					expect(res.body).to.include.keys('message', 'errors');
					expect(res.body.errors).to.include.keys('username');

					assert.strictEqual(typeof res.body.message, 'string');
					assert.strictEqual(
						typeof res.body.errors.username,
						'string',
						'missing key [username]',
					);

					done();
				});
		});
	});

	describe('Error Response: Body validation errors', () => {
		it('Status Code - 400', (done) => {
			const incompleteUser = {
				firstName: 'not-an-email',
			};
			agent4
				.post('/users')
				.send(incompleteUser)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken4)
				.expect(400)
				.end((err, _res) => {
					if (err) return done(err);
					done();
				});
		});

		it('Body Matches API Docs', (done) => {
			const incompleteUser = {
				firstName: 'not-an-email',
			};
			agent4
				.post('/users')
				.send(incompleteUser)
				.set('Accept', 'application/json')
				.set('X-XSRF-TOKEN', xsrfToken4)
				.end((_err, res) => {
					expect(res.body).to.have.property('message');
					expect(Object.keys(res.body.errors)).to.include(
						'username',
						'email',
						'lastName',
					);
					done();
				});
		});
	});
});
