const assert = require('assert');
const HttpStatus = require('http-status-codes');
const nock = require('nock');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/utils', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'cities',
      'counties',
      'states',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /geocode', () => {
    it('returns address components for a lat/lng', async () => {
      nock('https://maps.googleapis.com:443', { encodedQueryParams: true })
        .get('/maps/api/geocode/json')
        .query({ latlng: '37.7782251%2C-122.4424955', key: process.env.GOOGLE_MAPS_SERVER_API_KEY })
        .reply(
          200,
          [
            '1f8b08000000000002ffed9c5b57a33a0085dfe757b0fa3a4e572e04c279633ab4a263efd5ea59b358b4c5b64ac101aad659fef713da5a7b0149b5688f836f4a487648b2f747d2fae78b2008b91b7bec1b5db767e5847f843fe19fc2bf76ddd18d3b767a8b2bb9dae121f92aa3ba7066f981e53982daeb0d83a1eb1c080dd3118a9ee974877ed73d100aea81d06aa8b983a7cafab6db31ede7aaa8a89c3e55970b0b3d4e8be63ccb1fdb811f96f9777eef93a0f0b2d9ebb112a158a6cdb19cd5921be5e777d9aed3371c73346b1a522a2e843d17f207ae1724960a2637d6ac4d7647e05916bb653cea585e4ef8b552f8f1602b5125d7ee598e5032034b506f2d676c254b5cbb2741ade78e03eb8d2ad7c73d5923c71dcb221d6bd81f745c6fe0babddc019b99aecd6eeb9af61b85af4ccf64d58d62824edb659a86c124358d42812dbdb0fe44a97c772d8b377ba3a13364b3d70c86b796617a9669d8d6ad651b6897fd29b02774e97aced04cee45417db566b84bcd2d6718583da111b035e527cb6e35126477c3f1f0763a4d141142922c2daed8b2ba1bd70f16a6bc26eaf9b75f4b95e4d8808ecc803d23636ec50bb314d6ec28221384a9a8d564082bed5beec80a1fd352fc2cfade35a7beb171697ad50cc20b58cecb32c592ac80e90fdcecb6edf4c392df20427951448410f1a54158b46b84cf6bdac77aa5526c56aa6b8f34773bb4ee6ed8938f16e8b02b03cbf4a32faf774191a14429400a249b5dd8ec05444012a122034ad60b3f46cc0fe6ff833b8b538a0c20556675f348c10a10f14cf98694b879b5ac912188d9b58c616fe60603fda8d835bfd93f2beae05cad8b6d176b0670da522db77a5304b7ccaf45d28bf895b6b78797798d310813d6998be955042d2c96cdd37a5bdcb073ce5120e2e09ce85219e7649c93710e577f32cef97b388799e587730e428a9c0c3808c26d01472d9734432f37b57ab5f2536d6a3f52651d2253694a0ca2c2c33a50663d4a877542e692a7757349c154066067aca35de9f795a636d1b5de6da754b73bc3ef87e7edbaad6b4574d1b8ebb75071ac6b1793f3337265b6cb579dc95dbf06b47ea559bb3f69b67cbd78daac35f48e36b83e2eaa6ea3d0d5bc16693cf4f533553b1da85effe47b479d3c68d57e6565327e309b00f00d2a0ae50194f8a219a5649492510a577f324af98b2865ee98e9a04a277cadf677c1001443c493fd548e88dab7a63e8500f3b48e09438384a08f612b1e9803b29408739242a42d61aea4554eb4665d2f18052d24ba74518e486406443ca38945494a8de4089dd7cda14404a24876ba6975d7089a4f9b56675a61acde15fd1f3f4f62b96b8d0252c3adf9495bb24fc5175c71aae77db70c603280c900264ef38700cc56ac305ff0afda147f2748403c5e8eb09c0622f0b59d141f6fc0031471fcb2debcc80278aff1004b223f1e004a496a78809feae6013f993ee9de011e94181e5c7b1727e2c5c355ed5aadeb6068a362a9dbf657d7d4d6675aaf5ebe618d2f7c2c87e74c2b02045263987238e904f75260534fa89acec0747a36c7be4cd9ad46254686091926649830fde1c084e8c5b73f90a04822a6c99e8e658990dde70a52a8c2d1ba280331825276c40a4446f2e67ec6062bc832de9215d46ab55e69eb276a534b15133ecd10f2ee1660e377e1a833db2d38ae1ed97dacd2ce61fc6e01474ca596bed9ab7a96c1dcfdc932388d0cdedb57742a62c2f329418431c1cacead9b500037f7d0375a67d68d159a52fa522063ba991f6bd105b0b47694b02fe9fb898690377d2bf5917aff733c4ddfa332d16f06d727ee40dbcbf47da753c62c59b364fd1b9375af4ec5154299c57258b144d1ee9d98bd84f1ec8d2a584aeb4c9cb23840492fb298220cf6334a3fcbf8f1e6e8c3a48abd8e35cdd1e648bd2c578f2e1eacf3d81c8d0ca0d492330ba92ca47834ff0f43ea43e249410ab3de647b4314ca9ba4fe36779318fc2325a96d9c87ec5d2cbd3359913d824d8b5df557c8f861eb33d97789a74f337ebcf1a4d7bedfa8256486f1644810d152b7d9d2dcd8784a30f8f709aa2c04b210480e81f978675910db76fa5900649c980598ae753fcb828fcf82d6b55ffedd03061cd0d82cd8de2a538b87cc4ed3b0d3e7a7fafe062aa23c000a8152c22280621e62b8fe754ee18d2b10e509a234f10b10625ea408009cb0005f65a0d2f4038ed24b9f6f840af34f59c168db7fd691be7f7ea6e1e3f5cfeaa9e8b60d895c896afdf48cea47927ed43af75fe19f713e939a7feebf17c52a4cdd8964982798d2a8ff9b232c4d2749ca534ad87adce54c8634dcb4dc64a8a586a10cf2442129ed3703052031de82149297d94ba3b2ed97e9d337a0cf316abcd65378389f10bd0125bb56af7997568d1c93cafd5dacf5bcbc3ea7cdced664ce670b6e3c5b8295e3dc97c72fff0112d9770714510000',
          ],
          ['Content-Type', 'application/json; charset=UTF-8', 'Content-Encoding', 'gzip']
        );
      const response = await testSession
        .get('/api/utils/geocode?lat=37.7782251&lng=-122.4424955')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.address1, '1884 Golden Gate Ave');
      assert.deepStrictEqual(response.body.cityId, '2411786');
      assert.deepStrictEqual(response.body.countyId, '06075');
      assert.deepStrictEqual(response.body.stateId, '06');
      assert.deepStrictEqual(response.body.zip, '94115');
    });
  });
});
