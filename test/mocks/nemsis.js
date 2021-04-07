const nock = require('nock');
const path = require('path');

// Uncomment line below to record external HTTP calls
// nock.recorder.rec();

const mockReposRequest = () => {
  nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
    .get('/stash/rest/api/1.0/projects/NES/repos')
    .query({ limit: '100' })
    .reply(
      200,
      [
        '1f8b0800000000000000',
        'ecdd5f53db381000f0afe2f1d3dd0c21010a49783a8e726dae0498a6077373d307e388588dff642c1b483b7cf7936d59ab10293577fb628f66fa40b3ca6ec8feb2a3c4027eb88c7e27eee9f168cf0d694433f7f46030d87329bbf45876e32d782c4b73b2e73e7a614e987bfacf0f9785f9c23d75bdd0bbf722cfe5abe7fc6e458ad88bf81ddc3319617e34e14177c133f3ff655e56c66fcf269767bf5f5e88db7236258c95c5dcb3478ff2bb8784c71e9274597e291ec32a4dbe119f3fc61fee92acf9e2ab8b99287f7228ab5f918851362b6a311e9d13e6a77495d124e6c19bfc3ea4be939255c26896a49430879771ca87d6632be2d38732ce923cf545300b8873e51519bcd0b98848ba20b1bf76a6644e7d7ecb8ca48fb4583b89f9eaa85ce8ccd62c2391f3cbd5c5743699fd5a1488e75e3adfe70f69553e88fabbcad6abf2615f7f9e9e5dba451fe2252bbe4746c287f2090f52c2bf70832c5bb1d37e9fa762c17e9e79c1dcf7f7937451ddd2174f0feb174fcbcbd79717a8f4e0858c28a9fd3089c95b72f346f663c2faa2e9fb5543c5335edcd97dd993c9180b782abee4b7ad74a7c3f1786ccec4efc91ff9defffad6fb6573ebfcfdfb347962a47a3e54bb6c0974c72add2a60e5b6446e536cbcad1a6b7bffe515b095aa7a01a0b9e5f90d6c790779e3e21ef3a2a4e67b385026af58e0ccc402cbb8258c1bf3db2080',
        '31877724c41cc71b650cbc53fa9db7b81ecb2703702d2316744b4037c357f5156730eb72a14ee6aa80c9eed28b99c724de0305af0c59bdddd25b351689af2e19aedfaa821e30ef1ce5ed8a29cc5f3074ae062de296206e4a0f5a8fb09f302543dc4b400903e5244c526f9ec80df20940869065dc35c6a2b71888b5a930098b0226c071ccef40fd3c93c3f84831ac462de3ce3196ed45916cc8868a59d6d07b9e93d07bf2522231bf930fe33d84ace496486e04afee39cae6589f0c73735c573000a62c4ba99ff592871e1fdd79744fe1e3b7216016cb9ce4c13987651676a7606b2ce020ff696254f09a6a7afc243bead5e8c4003f38862df5c59723e74686adf596586faa52e93ec276c4980d713ba2d4d0837ee07b6f3a87cf398ee5a3f84346ace38e39164d4730accd84e857e4d7db5d107e5fe5333a98c31f64c4daed985dd17404bbda4c8876457e83dddc8be4ae19ce5c7ca86eb66a5ba2b61934de54945df17622cc5d70915d8f35e06f0729957316dee47dac03166c4bc036a556b51c61caea12210ed92abd9e2ddf380489540b278326e2768bb66368cb862398d5e441245b6637880df99390503839013b830984acdb96b86d864d34166587a04f86b94ba82b1800c773eac1b1b5211c5b9bc888e5db29be555f71f4ea72a1e2ad0a18ec264f00178eac4daa9badda4ea9e54dc521bb9508d52bcfaec7ba79c272',
        '08663ed9f3952d03db949af94ce41bb7b7c6939a3868779dac5c9238cbfde55ac285a33c9f2064e9768daee82d065e6d2a4cbea2801e7098e4946d6c71e1fccea512b3845b42b8113ad975943d83211be6c64196d02b8e3c1acb136843b8e63b15b75bbd5dd25b761b45ae2613a6da32bd496cba0e792b24da1305ad0c59b7dd725b351689ae2e19aedeaa82093027e70739235906efdb868ae2cdb8a5dc12cacd012a0d46d808efc887b81bdea862904dfd802ebc58a2862b6d530859cf5df32c7a8b41599b0a53b12860021cf3479164f09e6eac08869825dc39c2a2b92886b5b950118b0a26c58c15ff562b79526734501cab512bb925921bd293bdc5d92a9bf2a1ee96a188d9336f36603ed8c02c4256724b24bf055fd15b9491ac4b853a91ab0206c0499c291f148f00d054462cdfaef1ad5a8ba1579709136f955f6f3716ddecf939cb92a847421291183eb83838864f2e64e7cfcbb5ce05acb5bc3bc6dbe402c17bb3d4882f005341c32b82dca7ea2fca1c1d29e264c8826f09f8662445635176d5fa64985beaba8209f0a3073fe8397aa7f811018bb725789b932b3a8b319b358930277199dec4f6a91778d18a05147e69cae85801f4e47c54e21671e7102b00502c1bf3a19256aa98657f232923f234dce86483f59f75d09aeea0e9aaf548a075c990355725cc9423f24c7df9e376a3e106e5691db4945b42b931bd',
        'aaef485b647d3adc4d725dc34c79cd9949c8a30dc87f5721cbb8258cdf42af683bd23cde4e853c8d8b0206c0499a053ddf4b13feacc0fb3db8a47d552c70ce6181c5dc12cccdf86df41f672eef48893a9b37eaece23df796ca798df1e015eef775d8d2ee1eedaaf788b07509f159575576a02669dc8bbcb438b5dfa3ac38495a5f6e393c78059c2f75a6d5526722975aec9dc3ae318107ffa7c9d15f049a8afa17441250f956720c073faeab9b2df42e412f7a8d827a3b1126e022bb01eb32f48204fefce318d45c43c8a2ed145ad1581cb8da64a878450503e0942c12797e7f0c57b6afeb80c5db12bc8dc9959d45f8b4439708f1b38e2abd9eed8ac4315b878f9ef2879ac6705dfb66336c09b7847023766aef5166b03921e61c56ab1850e724cd925e0ad7520e0f60037c53469dcff6624aab48374608cd4718cdc66c88f359a9a1f79c06c99c88377b7248c3f18dcf45587c866145b7477423806aef5186b43921e69056abe851f3666baeb18ce1f8c6ac5860afb1b41076538a9b0410a6f5ae8488037bb3cc2edeafaeb10c5fe1b6d758da46fb0d0c11afb1981362ce6cb58a1e75468a1f9f65441e221dc3c98e2f4acc726e09e7a60065e31186b42117e27c96154c8a9fe1d77e8ec78ae067fb5b3fdba4b721b767a43fa9aec984397ecbf47ab139eb3dd27441e3ad8bda20e8af99735baeb157b33b2a794b018aea9f',
        '64c514be55caa09de712ae8e14dfd5ad96744b4837f6c72308bb8aed34881b8a6291deea23498b1f02afe7f1000e19ddca8825db31b2a2e9086ab59910e18afc06bbe52c56fef2345c23b98590d5db35bda2b7187cb5a930fd8a027ac04ffc5e345e64f2dcc5e1000cdda9418bb86388a1f5088c4dc9102143090365c2b2ded640865344773ceed8a9dc61d02a000cd3e67c98acd52a06d994f949cc28cc68385e74a7c4ace8ae89ae9b8ba1599f0b53725dc1a0789d447c7e4bc370fae24e46ace0ae09ae5a8be1579709536f955fb5fbb5e496724083977f010000ffff',
        '03008b8aca2e98a10000',
      ],
      [
        'X-AREQUESTID',
        '@1ALC98Jx696x856908x0',
        'X-ASEN',
        'SEN-13891561',
        'Cache-Control',
        'no-cache, no-transform',
        'Vary',
        'accept-encoding,x-auserid,cookie,x-ausername,accept-encoding',
        'X-Content-Type-Options',
        'nosniff',
        'Content-Encoding',
        'gzip',
        'Content-Type',
        'application/json;charset=UTF-8',
        'Transfer-Encoding',
        'chunked',
        'Date',
        'Mon, 06 Apr 2020 17:36:34 GMT',
        'Connection',
        'close',
      ]
    );
};

const mockAlabamaFilesRequest = () => {
  nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
    .get('/stash/rest/api/1.0/projects/NES/repos/alabama/files')
    .query({ limit: '100' })
    .reply(
      200,
      [
        '1f8b0800000000000000',
        '848cc10ac23010447f25ec39d40a9e7a13f556419aa388ac756d03492ad98d14c57f372ae245f03633ef3137b8a04bc4506da1211e526c8927f37a6f0485962868488ad13bd060da9e3c4a1cc25358adcd0773dbffc13f1e1c1ed0a3fa4eaa498e582d7a0c1da97ae88af3f1043b0d6caf04d54c83e51a5936d8e52a3151468251a02a3538eb6d4ed332e740e3cb326f1a9273f707000000ffff',
        '03009ce106e6e9000000',
      ],
      [
        'X-AREQUESTID',
        '@1ALC98Jx732x857384x0',
        'X-ASEN',
        'SEN-13891561',
        'Cache-Control',
        'no-cache, no-transform',
        'Vary',
        'accept-encoding,x-auserid,cookie,x-ausername,accept-encoding',
        'X-Content-Type-Options',
        'nosniff',
        'Content-Encoding',
        'gzip',
        'Content-Type',
        'application/json;charset=UTF-8',
        'Transfer-Encoding',
        'chunked',
        'Date',
        'Mon, 06 Apr 2020 18:12:59 GMT',
        'Connection',
        'close',
      ]
    );
};

const mockAlabamaDownloads = () => {
  for (const filePath of ['Resources/AL_StateDataSet.xml', 'Schematron/AL_EMSDataSet.sch.xml']) {
    nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
      .get(`/stash/projects/NES/repos/alabama/raw/${filePath}`)
      .replyWithFile(200, path.resolve(__dirname, 'nemsis/alabama', filePath));
  }
};

const mockCaliforniaFilesRequest = () => {
  nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
    .get('/stash/rest/api/1.0/projects/NES/repos/california/files')
    .query({ limit: '100' })
    .reply(
      200,
      [
        '1f8b0800000000000000',
        '84ccbd0a02311004e077d93a9c2758a5137f2a0531a5882c61f116f6ee20bb91a0f8eec6130b2bbb19be611e7043c9a4e04f70241d738aa4b3d5f2b2c5c8c2c6a44d112de07e39181aadd1309035a597ea2176d4a3a571780f36fbf0658ddd1f9e1ece0e94ef047ee18075876a07bcd66a295325c364e05b07c23dd7346f6b1ea84cabf0d1218b3c5f000000ffff',
        '030072eadf4cd3000000',
      ],
      [
        'X-AREQUESTID',
        '@1ALC98Jx696x856909x0',
        'X-ASEN',
        'SEN-13891561',
        'Cache-Control',
        'no-cache, no-transform',
        'Vary',
        'accept-encoding,x-auserid,cookie,x-ausername,accept-encoding',
        'X-Content-Type-Options',
        'nosniff',
        'Content-Encoding',
        'gzip',
        'Content-Type',
        'application/json;charset=UTF-8',
        'Transfer-Encoding',
        'chunked',
        'Date',
        'Mon, 06 Apr 2020 17:36:34 GMT',
        'Connection',
        'close',
      ]
    );
};

const mockCaliforniaDownloads = () => {
  for (const filePath of ['Resources/CA_StateDataSet.xml', 'Resources/CA_Facilities.xlsx', 'Schematron/CA_EMSDataSet.sch.xml']) {
    nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
      .get(`/stash/projects/NES/repos/california/raw/${filePath}`)
      .replyWithFile(200, path.resolve(__dirname, 'nemsis/california', filePath));
  }
};

const mockWashingtonFilesRequest = () => {
  nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
    .get('/stash/rest/api/1.0/projects/NES/repos/washington/files')
    .query({ limit: '100' })
    .reply(
      200,
      [
        '1f8b0800000000000000',
        '848cb10a02311005ff65eba02776e904ed14c42d2c4464098b17d8e420bb390ec57f379e58dbcd6386f78491a4b282bfc08975a825b02ecf9b1b1a196fc908d91653127080a1e7445686fc097607fc690dfd1f3d3f5c1d687c30f8b583a87b523bd2bd4d2b959b322a06be732031c546abae71e669aef06b731579bd010000ffff',
        '0300f0998ab6b4000000',
      ],
      [
        'X-AREQUESTID',
        '@1XB8LJMx1051x95866x0',
        'Cache-Control',
        'no-cache, no-transform',
        'Vary',
        'accept-encoding,x-auserid,cookie,x-ausername,accept-encoding',
        'X-Content-Type-Options',
        'nosniff',
        'Content-Encoding',
        'gzip',
        'Content-Type',
        'application/json;charset=UTF-8',
        'Transfer-Encoding',
        'chunked',
        'Date',
        'Tue, 06 Apr 2021 23:31:03 GMT',
        'Connection',
        'close',
      ]
    );
};

const mockWashingtonDownloads = () => {
  for (const filePath of ['Resources/WA_StateDataSet.xml', 'Schematron/WA_EMSDataSet.sch.xml']) {
    nock('https://stash.utahdcc.org:443', { encodedQueryParams: true })
      .get(`/stash/projects/NES/repos/washington/raw/${filePath}`)
      .replyWithFile(200, path.resolve(__dirname, 'nemsis/washington', filePath));
  }
};

module.exports = {
  mockAlabamaDownloads,
  mockAlabamaFilesRequest,
  mockCaliforniaDownloads,
  mockCaliforniaFilesRequest,
  mockReposRequest,
  mockWashingtonDownloads,
  mockWashingtonFilesRequest,
};
