abstract class _MediaTrack<Sample> {
  static gbid = 0;

  public id = ++_MediaTrack.gbid;

  public samples: Sample[] = [];

  public timescale = 90000;

  public duration = 0;

  public width = 0;

  public height = 0;

  public abstract type: 'video' | 'audio';

  public abstract format: string;

  public codec?: string;

  public sampleRate = 48000;

  public channelCount = 2;

  public destroy () {
    this.samples = [];
  }
}

export default _MediaTrack;