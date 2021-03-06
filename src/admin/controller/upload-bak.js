const Base = require('./base.js');
const fs = require('fs');
const qiniu = require('qiniu');
const accessKey = 'otAYIVzDSfvB7onZB9369WyXcLwjwGtZi1gmz2QZ';
const secretKey = '9FDFF926xydB87Ts2fru0g5o4mJrUOSnrllJ-g8B';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
module.exports = class extends Base {
  async brandPicAction() {
    const brandFile = this.file('brand_pic');
    if (think.isEmpty(brandFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/brand/' + think.uuid(32) + '.jpg';
    const is = fs.createReadStream(brandFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'brand_pic',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async brandNewPicAction() {
    const brandFile = this.file('brand_new_pic');
    if (think.isEmpty(brandFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/brand/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(brandFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'brand_new_pic',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async categoryWapBannerPicAction() {
    const imageFile = this.file('wap_banner_pic');
    if (think.isEmpty(imageFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/category/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(imageFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'wap_banner_url',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }

  async topicThumbAction() {
    const imageFile = this.file('scene_pic_url');
    if (think.isEmpty(imageFile)) {
      return this.fail('保存失败');
    }
    const that = this;
    const filename = '/static/upload/topic/' + think.uuid(32) + '.jpg';

    const is = fs.createReadStream(imageFile.path);
    const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
    is.pipe(os);

    return that.success({
      name: 'scene_pic_url',
      fileUrl: 'http://127.0.0.1:8360' + filename
    });
  }
  async generalAction() {
    const userId = this.ctx.state.userId;
    const generalFile = this.file('file');
    // 是否创建文件夹
    const fName = this.post('name') ? this.post('name') : 'temp';
    // console.log('generalFile', generalFile);
    if (think.isEmpty(generalFile)) {
      return this.fail('保存失败');
    }
    const filePath = '/static/upload/' + fName + '/';
    const RfilePath = think.ROOT_PATH + '/www' + filePath;
    if (!fs.existsSync(RfilePath)) {
      const isFilepPath = await think.mkdir(RfilePath, '0775');
      if (!isFilepPath) {
        return this.fail('文件夹创建失败');
      }
    }
    // 是否为多文件
    const that = this;
    const fileList = [];
    if (Array.isArray(generalFile)) {
      for (const item of generalFile) {
        const filename = filePath + think.uuid(32) + '.' + (item.name.split('.'))[1];
        const is = fs.createReadStream(item.path);
        const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
        is.pipe(os);
        const data = {
          user_id: userId,
          name: (item.name.split('.'))[0],
          path: filename,
          size: item.size,
          type: item.type
        };
        const aid = await this.model('attached').add(data);
        data.id = aid;
        fileList.push(data);
      };
    } else {
      const filename = filePath + think.uuid(32) + '.' + (generalFile.name.split('.'))[1];
      const is = fs.createReadStream(generalFile.path);
      const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
      is.pipe(os);
      const data = {
        user_id: userId,
        name: (generalFile.name.split('.'))[0],
        path: filename,
        size: generalFile.size,
        type: generalFile.type
      };
      const aid = await this.model('attached').add(data);
      data.id = aid;
      fileList.push(data);
    }
    return that.success({
      fileList
    });
  }
  async qiuniuAction() {
    const brandFile = this.file('file');
    // const model = this.model('music');
    // let fn, data, result;
    if (brandFile !== '') {
      if (think.isEmpty(brandFile)) {
        return this.fail('保存失败', 0);
      }
      const options = {
        scope: 'actfou'
      };
      const putPolicy = new qiniu.rs.PutPolicy(options);
      const uploadToken = putPolicy.uploadToken(mac);
      const config = new qiniu.conf.Config();
      // 空间对应的机房
      config.zone = qiniu.zone.Zone_z2;
      const suffix = brandFile.name.split('.'); // 取.后面的后缀，eg:mp3
      const filename = '/static/upload/' + think.uuid(32) + '.' + suffix[suffix.length - 1];
      const is = fs.createReadStream(brandFile.path);
      const os = fs.createWriteStream(think.ROOT_PATH + '/www' + filename);
      is.pipe(os);
      const localFile = is.path;
      const formUploader = new qiniu.form_up.FormUploader(config);
      const putExtra = new qiniu.form_up.PutExtra();
      // let key = 'word/music/bg/' + type + '/' + think.uuid(32) + '.' + suffix[suffix.length - 1];
      const key = think.uuid(32) + '.' + suffix[suffix.length - 1];

      // 文件上传
      const fn = new Promise((resolve, reject) => {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
          respBody, respInfo) {
          if (respErr) {
            return reject(respErr);
          }
          if (respInfo.statusCode === 200) {
            return resolve(respBody);
          }
        });
      });
      const data = await fn;
      console.log('data', data);
      // formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
      //   respBody, respInfo) {
      //   if (respErr) {
      //     throw respErr;
      //   }
      //   if (respInfo.statusCode === 200) {
      //     console.log(respBody);
      //   } else {
      //     console.log(respInfo.statusCode);
      //     console.log(respBody);
      //   }
      // });
    }
  }
};
