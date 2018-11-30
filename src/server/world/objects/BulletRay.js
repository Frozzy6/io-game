const defaultParams = {
  width: 10,
  height: 20,
}

class RayBullet {
  constructor(props) {
    const options = defaults(props, defaultParams);
    this.wasSendedToClients = false;
  }
}

export default RayBullet;
