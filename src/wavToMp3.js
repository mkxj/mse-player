export default function wavToMp3 (files) {
  return Promise.all(files.map(function(file) {
    return new Promise(function(resolve, reject) {
      const wav = lamejs.WavHeader.readHeader(new DataView(file))
      const samples = new Int16Array(file, wav.dataOffset, wav.dataLen / 2)
      const buffer = [ ]
      const mp3enc = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 128)
      let remaining = samples.length
      const maxSamples = 1152
      for (let i = 0; remaining >= maxSamples; i += maxSamples) {
        const mono = samples.subarray(i, i + maxSamples)
        const mp3buf = mp3enc.encodeBuffer(mono)
        if (mp3buf.length > 0) {
          buffer.push(new Int8Array(mp3buf))
        }
        remaining -= maxSamples
      }
      const flush = mp3enc.flush()
      if(flush.length > 0){
        buffer.push(new Int8Array(flush))
      }
      const blob = new Blob(buffer, { type: 'audio/mpeg' })
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        resolve(reader.result)
      })
      reader.addEventListener('error', (error) => {
        reject(error)
      })
      reader.readAsArrayBuffer(blob)
    })
  }))
}