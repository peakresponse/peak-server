const nock = require('nock');
const path = require('path');

// Uncomment line below to record external HTTP calls
// nock.recorder.rec();

const mockReposRequest = () => {
  nock('https://git.nemsis.org:443', { encodedQueryParams: true })
    .get('/rest/api/1.0/projects/NES/repos')
    .query({ limit: '100' })
    .reply(
      200,
      [
        '1f8b0800000000000000ec9d5d6fdb461686ff8aa0ab5d208e87f33db9da6c9a6dbd1b2741dd26582c7a319f166b49344839895be4bfef50a234244d5ac20e17300da245e1ea0c5f523a8f5e1cce99a1fe9c17e91f76fe8af017f365ba4a37f35709002fe669f14e169b8ff2dac736f99d7d31ff229777b698bffacf9ff36279773d7f35974ba9e44acefd68e30f8398be98afe5ca1f317f7d082d529bcb5c2fee2ffc98b9a68268a7a8232401090589ffc30f2af46a1bbef6e7f7ffb7919badc8a7d717ef5efffddddbeab5bbe2d216c5f692e6afbfc8d49f63697dcc65f9cdf6cfea4a6ff3ec77abfd3bf9737e63effde0f76fafaa8b84801caef1bd5d156971559eacf061630b9da7b79b345bfbe0c73bb54cf52cb7b759916eb23cb5c5cc9f67b6bdb6b3e2d6ead46de3457697eb2ab859d8d97b592ac8e5ecedcae6d776adef6797d6a4dabf7265f32f6939f662ed47afb6036757f7c5c6ae667f79fff6f2eae2eaafe509d646e6e6a5bfa4dbed45ecdfd6e6fe767bd91f7ebe7cfd6e5ea66b7d53946fb2b04bb7cdcb22b7fe8ff962b3b92d5e9d9ffb4ff3e57afb265f66f9f579f5b114e7e5c7f1fdb7efdfc3099c5c16b6a6a897d9da9e20e9f376beb6c57945c2cb5dfeaacfb73c66fefdc541a328163b85bf35555e312144bf8c3fcc5fed8bffe55d9e6fd3b7973d5779f6b5b0bbb75e87b8b8a931ccea0cef222d841d37182945b1338201048d8613c2cf01619fed01087ea03208c05eb5875f9f239f9af5592157598d631e38ae46ccaeaa114d9e154bacc6101345a1e71a3a2e274b7e063c37b888e6fa11b501f86ea8f7709ea77ff82406c04500fc106a92edadd925d6ff9720c4b136567231913d7eb277e98e46ba4b66009677b27d10dfc875218b03c504d4283ec49a185b022832d6971cc2029908cd149d307e0618eff21dcf7197ce1020ef74bb49f6b9497d42d6697064921ccefea61e6dd24c89363a118c52ad91300e4006269a474f73e02196e73ea578a283720fd3d932cba5c902d130101d624d9ea1f763a10020162bc0122d1d3213cf4f9fe71340ac52de81e18b93bf169d1abb2f451ccb95701fc9ebb53f20d5779b0033aac15c0f3779c6c670cdb01636a11e6ba10d5713cf4f9fe7a3201e521e6dd07d5203387490ee06dbd8a5fc2a731ba8c687d3ff1062ad021a32a20927883a8124600a3139213d7aa4f72cc4f2dcad130ff35eb787e4b4d8e4a9de9c65eecc9bf9dd4ad54be900cc0fd5b859e6666fc2b8d69cb4715a51603447543bcb2886d34cc708083f01ce0e4c620a92e37a0314275d27e9fe16d80d3adb7375803fb411dffe82661f0fe126f3d26a419076c2218929d616dba9f01e01f34700ad11116becbd52f1de5e93ee06dbf9f23c3535470f7dc57f1c422d134710384c94800a32e3b8932499801e3dd01509b13077cac4835cc976437c6dfd51f5b22434157f3c845a10138a954bb8b409218a5223989d207efa101f07b08221a6f8e89418a0dea8747b20be93ab4070e81afeb87bbd89af43d830c9389009c34e72e71236e1fbf4f13d069ecf75ac013fd48877df52b39bda85bf754cd303b734f4097fda475ae5b0048a26182be510e31648a1a7727804e41e076f87428cef76290c60bb3bd96e7e7d4db1088d141a5a831755a05536580413ca05168980005044dc54fb8e80de23e06d298835de0e9178e7dd8af6a0bbf4ef374bc3220d1ada801721d6041830840cc7d05999280c00946202f819005ce53b9ae14e9d0130ae747b485e9b54d6d6ccd1d002bc38849a1c332b81d322e1dc220704722a7113c74f9fe31310dc653ca68ee89418a090a8747b20cebed6080eedbe8bddebadd5455851a721911824502a6decd4bd7e26f8fa7447b1fbe0f821c0f5a2ddd4b6d679d280c5bfba577942621293102030318042eb90990a8811907b04bb61d678fe7f56783eb6bef3c6ae3777fae63e101cba72ff0ab1d6da21c820d4de782111d80a67904613c34f9fe11300ac521ee3c0dd1a03b8f05eb89be465769716cd3238f4e2ded582ad19096dad8182696285af87ada07a5a523102968f4078a021d6927b84e25df920dc8df34aa6ebb0fc8d868edc651568622c88d28253564eaa716b2db36cba9f1b3fc65b0a6211ee1089c7772bda876e7ebff41f76a057d4e83dc45a77741a718d10355421622d35584d7774cf01e05dbee319eed21902e39d6e1fc99e2abdb82bec66136ef218a8e1dc1cd064da2498012ea949a0c5d802aef1b42079044c9f82632def31c5f223420354cc0df51ec453bd48afe53ad01d7a789721d65ec2060c40ca300e04374463a3a7adaa2300fb188c55bea3cdba536700b3ae74fb485efb93679b7003c8600de5106c2d05c29c3b90688e2563d409a8e5c4f208583e05c32ae75106dd2d328439ef95fb702e8af2dfdbdbb03c88a11ad0f5706b8ed908ea49665c018cb9e14ccbe9667004481f45f190f27887ee911ac2a40fd2fd60fb74d6a8c60daaab58ebf6902a489ce6460862b0167a9aa67b2e4897f91e82e7873ac3c05ceaf6909cad37f509671618b93c845aeb87a4a2481b9a082d59f9dc2229a7698e11707c0282bb8c47d51a5d1243541a3bdd6e88d755becef45db1c95667766957765d9fee081dc1436edf6cc7cede86b1ad0a04506128f7c722cd299642da09f311607e04d03e5662edfb34dd783bef3b4fcf37c3aabcf1d050c66a501d62ad87d195937c5227d0422981300ad969ce6f04e49f006995f21887efd618c0e2f7c27d247f91b54daa8cd710a922ade5a1183908a1b44c20a930471ce889e2a74ff151fcca6c47bb7587ca00debc55ede3f7ebd942ae6e8b455a7b260c133546bece7eaa0d683d18c622eab02218e044258209c5a767d18d80e65350ac811167ccbd4283b8734dbd1ff1df6d5ed8b0148f8306dfffdc479b7027c2394620c6944943a5860c4c937d2380fb0420773cc4db75b7d21096bd57ee677a65bfa53aec10e44983e9cb7db435db8728b089e5da485f453be7123d6dcf7e1e4cef781882e92ea56198de29f7337def490a44c306d1ffdec55a9bb69d92b05c282da40558306fd35301f23c782e591882e6873ac3b05ceaf6909ce59bc5999679e63f807073c8438ff17d3962f6268c68cd65537f7388128a8c2e0b0f23209d7e516204549f0064038da8bafa11a5210aeb86fc639c1b79535f1ac2718bf21ff6f1d65697f239e60028cc213452324ba75f4d1903e32761b96322dabd7bb50670f09af62374db7c7db69279b99be02c2dcaf5aca17dc34993743f7676b91b3bbb388c6d4f98382150828db11251241225a70d5e23a0fe44583b7089f6f8a39a43b97dc789babf19d922addd778626e687ddeb4de209e2823890706b80144e19a9a60a7d04c41f41b36420d6df1f6ac4fb7aa9d943edcd522eb2daaf6df2d074fc1062ad35ac44489e204c0cc60227d48269f3cc18e83d01be2ae531fedcad31801fef857b48ceed7516f615f0d074fcb08fb4aa0e059c4b0c4a14c39068e6109dd6f88d80e263f86db31dedc21d2a03f8f056b59bdf5bbb5e17f7cb2fb2fee3573cf41c3f36e3ad196c88b0a526d108424b12c35032d513e367b9ce442cd1fd5af15cd7b57be8beb3f9263bcbebcd19111a8e1fb7e1d9cf5ddd19230cb722718944ce72839453d32f233f03b60311d168f7490d407690ee063b5f64c656778681ecd076fcb98c57331f0fd0860c220900b08aca847184299c1e6b3e02b48f2359c722a698eed719a0a0ae8b77d3edd3d9d5b411a10979558ee86fdad8845b4978c289200612a280e113e14f9ff0235836b988f5efc7d4e22dbca9fe18e7ada68d402dca7b9a364c206d38d49a282c14819c92e919e92360fc54307b7b2d27bb78bfce002e5e17efa67b63cbadbf850d6b5945e847fe520bb6a6f96cd96837c8d7dfca3a48b803533372045c1f81f14043ac6df708c53bf641b80fe76fb567a00a5243f95bc723508d0508118021074a608209e5d313174680f129007eeb7c7ce9c9bedc213080216f55bbd1bd2bcebea4f975ba7ed03717a163f8ebd5ecd376506fc39c82843b4a01400a22036102f0b45f6604481fc1f1011db10e7d4430dea91f9ca007fb8d5c04d24387f1d7ddebad757ed096d5b45232b19271aa219efa32cf006e9feb689e1f680c80b0d7eca6f68bcdcbadec01dcd052fc7408b59e8b8a18560a034b90a2c42aa3f4b41d77fcec5624c4e2db29134f7025db03f1d69e6b2d45115a8a9f42acb581005b8998af960d0089060e723dcd4b3f038cab7c4773dca93300c8956e37c95f65b148d7d79bb0c80381d041fc5c8fb67f058e72273196227198396a1c9d96978e9fe6c0432ccf7d4af14407e51ea66db1396b5b3402a17df8d90f98f5fab411c6428535311452205842a7c7b08f81ec1390ac831133c5f188d000531d0df51ec4d34267eb22adb976e81e7eae055b95b4734241a1adc20448eefcede0b4c67404681fc3719ff068cfee161ac0b2f7c23d38df672befe801e6d024fc7c08b566eb18159010631491caf97fac9c26349e01cabb744783dc253300c63bd93ac4bf6d89ca3d23e0fb7f010000ffff',
        '0300450af1a0a1a30000',
      ],
      [
        'Content-Type',
        'application/json;charset=UTF-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Date',
        'Tue, 18 Jul 2023 17:45:28 GMT',
        'X-AREQUESTID',
        '@1HW1YL4x1065x473848x0',
        'Cache-Control',
        'no-cache, no-transform',
        'X-Content-Type-Options',
        'nosniff',
        'Content-Encoding',
        'gzip',
        'Vary',
        'cookie,accept-encoding',
        'X-Cache',
        'Miss from cloudfront',
        'Via',
        '1.1 a282f7d4f5ae65b33d809fbc6ea8641c.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Pop',
        'SFO5-P1',
        'X-Amz-Cf-Id',
        'fBP7x8Kpojexu7XlyWVxigiLgpun5cBS_XffLAFnXSwZzETNpjeNrw==',
        'Vary',
        'Origin',
      ]
    );
};

const mockAlabamaFilesRequest = () => {
  nock('https://git.nemsis.org:443', { encodedQueryParams: true })
    .get('/rest/api/1.0/projects/NES/repos/alabama/files')
    .query({ at: 'refs%2Fheads%2Frelease-3.5.0' })
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
    nock('https://git.nemsis.org:443', { encodedQueryParams: true })
      .get(`/projects/NES/repos/alabama/raw/${filePath}`)
      .query({ at: 'refs%2Fheads%2Frelease-3.5.0' })
      .replyWithFile(200, path.resolve(__dirname, 'nemsis/alabama', filePath));
  }
};

const mockCaliforniaFilesRequest = () => {
  nock('https://git.nemsis.org:443', { encodedQueryParams: true })
    .get('/rest/api/1.0/projects/NES/repos/california/files')
    .query({ at: 'refs%2Fheads%2Frelease-3.5.0' })
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
    nock('https://git.nemsis.org:443', { encodedQueryParams: true })
      .get(`/projects/NES/repos/california/raw/${filePath}`)
      .query({ at: 'refs%2Fheads%2Frelease-3.5.0' })
      .replyWithFile(200, path.resolve(__dirname, 'nemsis/california', filePath));
  }
};

const mockWashingtonFilesRequest = () => {
  nock('https://git.nemsis.org:443', { encodedQueryParams: true })
    .get('/rest/api/1.0/projects/NES/repos/washington/files')
    .query({ limit: '100', at: 'refs%2Fheads%2Frelease-3.5.0' })
    .reply(
      200,
      [
        '1f8b0800000000000000848cb10a02311005ff65eba02776e904ed14c42d2c4464098b17d8e420bb390ec57f379e58dbcd6386f78491a4b282bfc08975a825b02ecf9b1b1a196fc908d91653127080a1e7445686fc097607fc690dfd1f3d3f5c1d687c30f8b583a87b523bd2bd4d2b959b322a06be732031c546abae71e669aef06b731579bd010000ffff0300f0998ab6b4000000',
      ],
      [
        'Content-Type',
        'application/json;charset=UTF-8',
        'Transfer-Encoding',
        'chunked',
        'Connection',
        'close',
        'Date',
        'Tue, 18 Jul 2023 17:45:28 GMT',
        'X-AREQUESTID',
        '@1HW1YL4x1065x473849x0',
        'Cache-Control',
        'no-cache, no-transform',
        'X-Content-Type-Options',
        'nosniff',
        'Content-Encoding',
        'gzip',
        'Vary',
        'cookie,accept-encoding',
        'X-Cache',
        'Miss from cloudfront',
        'Via',
        '1.1 e2d7efb4a6fe4a49c212c47079f43f9c.cloudfront.net (CloudFront)',
        'X-Amz-Cf-Pop',
        'SFO5-P1',
        'X-Amz-Cf-Id',
        'qTr9GR8R2x9BAe6AJdNJ2GXvXed0cuoKOqGxGB1jr1b9_mUcjOOz4A==',
        'Vary',
        'Origin',
      ]
    );
};

const mockWashingtonDownloads = () => {
  for (const filePath of ['Resources/WA_StateDataSet.xml', 'Schematron/WA_EMSDataSet.sch.xml']) {
    nock('https://git.nemsis.org:443', { encodedQueryParams: true })
      .get(`/projects/NES/repos/washington/raw/${filePath}`)
      .query({ at: 'refs%2Fheads%2Frelease-3.5.0' })
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
