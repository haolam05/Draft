import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { Create, Draft, Dummy, Join, reset } from './routes';


describe('routes', function() {

  it('Dummy', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/dummy', query: {name: 'Kevin'}});
    const res1 = httpMocks.createResponse();
    Dummy(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getJSONData(), 'Hi, Kevin');
  });

  it ('Create', function() {
    reset();

    // empty drafter
    let req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: '', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 0 } });
    let res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafter' can't be empty!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: '', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafter' can't be empty!!`);

    // empty drafters
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: '', options: '11\n22\n33\n44', rounds: 0 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafters' can't be empty!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'bb', drafters: '', options: '11\n22\n33\n44', rounds: 0 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafters' can't be empty!!`);

    // empty options
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '', rounds: 0 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Options' can't be empty!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'bb', drafters: 'aa\nbb\ncc\ndd', options: '', rounds: 0 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Options' can't be empty!!`);

    // Negative rounds
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: -2 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Rounds' can't be negative!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: -3 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Rounds' can't be negative!!`);

    // Drafters does not include Drafter
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'ee', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafters' must include 'Drafter'`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'ff', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(res1._getData());
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafters' must include 'Drafter'`);

    // Rounds * Drafters != Options
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafters' * 'Rounds' != 'Options'`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafters' * 'Rounds' != 'Options'`);

    // Create Success
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    var result = JSON.parse(`${res1._getData()}`);
    assert.deepStrictEqual(result.draftID, 0);
    assert.deepStrictEqual(result.optionsRemain, ['11', '22', '33', '44']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'aa');
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'bb', drafters: 'bb\naa\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    res1 = httpMocks.createResponse();
    Create(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    var result = JSON.parse(`${res1._getData()}`);
    assert.deepStrictEqual(result.draftID, 1);
    assert.deepStrictEqual(result.optionsRemain, ['11', '22', '33', '44']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'bb');
  });

  it('Draft', function () {
    reset();

    let req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    let res1 = httpMocks.createResponse();
    Create(req1, res1);

    // Draft Success
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 0, option: '11' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(result.draftID, 0);
    assert.deepStrictEqual(result.optionsRemain, ['22', '33', '44']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'bb');
    assert.deepStrictEqual(result.picks, [[1, '11', 'aa']]);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 0, drafter: 'bb' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 0, option: '22' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(result.draftID, 0);
    assert.deepStrictEqual(result.optionsRemain, ['33', '44']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'cc');
    assert.deepStrictEqual(result.picks, [[1, '11', 'aa'], [2, '22', 'bb']]);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 0, drafter: 'cc' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 0, option: '44' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(result.draftID, 0);
    assert.deepStrictEqual(result.optionsRemain, ['33']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'dd');
    assert.deepStrictEqual(result.picks, [[1, '11', 'aa'], [2, '22', 'bb'], [3, '44', 'cc']]);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 0, drafter: 'dd' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 0, option: '33' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(result.draftID, 0);
    assert.deepStrictEqual(result.optionsRemain, []);
    assert.deepStrictEqual(result.roundsRemain, 0);
    assert.deepStrictEqual(result.currDrafter, 'aa');
    assert.deepStrictEqual(result.picks, [[1, '11', 'aa'], [2, '22', 'bb'], [3, '44', 'cc'], [4, '33', 'dd']]);

    // Invalid DraftID
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 1, option: '11' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `Invalid 'draftID'!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 2, option: '11' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `Invalid 'draftID'!!`);

    // Invalid Option
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 0, option: '00' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `Invalid 'Option'!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/draft', body: { draftID: 0, option: '55' } });
    res1 = httpMocks.createResponse();
    Draft(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `Invalid 'Option'!!`);
  });

  it('Join', function () {
    reset();

    let req1 = httpMocks.createRequest({ method: 'POST', url: '/api/create', body: { drafter: 'aa', drafters: 'aa\nbb\ncc\ndd', options: '11\n22\n33\n44', rounds: 1 } });
    let res1 = httpMocks.createResponse();
    Create(req1, res1);

    // Missing DraftID
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: '', drafter: 'bb' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Draft ID' can't be empty!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: '', drafter: 'cc' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Draft ID' can't be empty!!`);

    // Missing Drafter
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 0, drafter: '' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafter' can't be empty!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 1, drafter: '' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Drafter' can't be empty!!`);

    // Invalid DraftID
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 1, drafter: 'bb' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Draft ID' does not exist!!`);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 2, drafter: 'bb' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(JSON.parse(result.msg), `'Draft ID' does not exist!!`);

    // Join Success
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 0, drafter: 'bb' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(result.optionsRemain, ['11', '22', '33', '44']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'aa');
    assert.deepStrictEqual(result.picks, []);
    req1 = httpMocks.createRequest({ method: 'POST', url: '/api/join', query: { draftID: 0, drafter: 'cc' } });
    res1 = httpMocks.createResponse();
    Join(req1, res1);
    var result = JSON.parse(`${res1._getData()}`);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(result.optionsRemain, ['11', '22', '33', '44']);
    assert.deepStrictEqual(result.roundsRemain, 1);
    assert.deepStrictEqual(result.currDrafter, 'aa');
    assert.deepStrictEqual(result.picks, []);
  });
});
