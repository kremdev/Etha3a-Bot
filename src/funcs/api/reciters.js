export async function searchReciter(name) {
    const data = await fetch(process.env.API + `/reciters/search?name=${name}`);
    const reciter = await data.json();
    return reciter.data ?? [];
}

export async function searchSurah(surah) {
    const data = await fetch(process.env.API + `/surah/search?name=${surah}`);
    const _surah = await data.json();
    return _surah.data ?? [];
}

export async function getReciters() {
    const data = await fetch(process.env.API + `/reciters`);
    const reciters = await data.json();
    return reciters.data ?? [];
}

export async function getSurahs() {
    const data = await fetch(process.env.API + `/surah`);
    const surahs = await data.json();
    return surahs.data ?? [];
}

/**
 * {
  "success": true,
  "data": [
    {
      "id": 104,
      "name": "محمد الأيراوي",
      "date": "2026-01-14T08:26:55.000000Z",
      "moshaf": [
        {
          "id": 104,
          "name": "ورش عن نافع من طريق الأزرق - مرتل",
          "server": "https://server6.mp3quran.net/earawi/"
        }
      ],
      "apiName": "mp3quran.net"
    },
    {
      "id": 105,
      "name": "محمد البراك",
      "date": "2025-08-30T21:47:54.000000Z",
      "moshaf": [
        {
          "id": 105,
          "name": "حفص عن عاصم - مرتل",
          "server": "https://server13.mp3quran.net/braak/"
        }
      ],
      "apiName": "mp3quran.net"
    },
 */
export async function getTilawah(name, surah) {
    if (name && surah) {
        const reciters = await searchReciter(name);
        const surahs = await searchSurah(surah);

        const reciterData = reciters[0];
        const surahData = surahs[0];

        if (!reciterData || !surahData) return null;

        const audioData = await fetch(
            process.env.API +
                `/reciters/${reciterData.id}/surah/${surahData.id}`,
        );

        const audio = await audioData.json();
        return audio.data?.audio ?? null;
    }
}
