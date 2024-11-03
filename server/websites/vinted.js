const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
//const fetch = import("node-fetch");
// const cheerio = require("cheerio");
const fs = require("fs");

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = async (data, id) => {
  console.log("ici ");

  const results = data.items.map((item) => ({
    legoId: id,
    title: item.title,
    price: item.total_item_price,
    link: item.url,
    favorites: item.favourite_count,
    image: item.photo ? item.photo.url : null,
  }));

  // Retourner les résultats encapsulés dans un tableau
  return results;
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns
 */
module.exports.scrape = async (url, id) => {
  try {
    console.log(
      "url ------> ",
      `https://www.vinted.fr/catalog?search_text=${id}`
    );
    const csrfToken = await extractCsrfToken();
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "fr",
        Connection: "keep-alive",
        Referer: `https://www.vinted.fr/catalog?search_text=${id}`,
        "X-Csrf-Token": csrfToken,
        Cookie:
          "v_udt=WWh4Yk9EclBVYmZJYzdQMGtJVEgxd2puZnVBdi0tZ28rM1AxQzQ0YlhBMzRoNS0tMzhLUUw4aGdxUjQvemMxQ3FHQUNKQT09; anon_id=81735f50-e397-4acf-8760-2d4039a02d38; anonymous-locale=fr; v_sid=df784a9c1dae2d717df4862f95143f59; ab.optOut=This-cookie-will-expire-in-2025; OptanonAlertBoxClosed=2024-11-02T11:20:01.321Z; eupubconsent-v2=CQHdaZgQHdaZgAcABBENBOFgAAAAAAAAAChQAAAAAAFBIIIACAAFwAUABUADgAHgAQQAyADUAHgARAAmABVADeAHoAPwAhIBDAESAI4ASwAmgBhwDKAMsAbIA74B7AHxAPsA_QCAAEUgIuAjABGgCggFQAKuAXMAxQBogDaAG4AOIAh0BIgCdgFDgKPAUiApsBbAC5AF3gLzAYaAyQBk4DLgGcwNYA1kBsYDbwG6gOCAcmA5cB44D2gIQgQvCAHQAHAAkAHOAQcAn4CPQEigJWATaAp8BYQC8gGIAMWgZCBkYDRgGpgNoAbcA3SB5IHlAPkAfuBAQCBkEEQQTAgwBCsCFw4BgAAiABwAHgAXABIAD8ANAA5wB3AEAgIOAhABEQCfgFQAL0AdIBHoCRQErAJiATKAm0BSACkwFdgLUAXQAxABiwDIQGTANGAaaA1MBrwDaAG2ANuAcfA50Dn4HkgeUA-IB9sD9gP3AgeBBECDAEGwIVjoJQAC4AKAAqABwAEAALoAZABqADwAIgATAAqwBcAF0AMQAbwA9AB-gEMARIAlgBNACjAGGAMoAaIA2QB3gD2gH2AfoA_4CKAIwAUEAq4BYgC5gF5AMUAbQA3ABxADqAIdAReAkQBMgCdgFDgKPgU0BTYCrAFigLYAXAAuQBdoC7wF5gL6AYaAx4BkgDJwGVQMsAy4BnIDVQGsANvAbqA4sByYDlwHjgPaAfWBAECFpAAmAAgANAA5wCxAI9ATaApMBeQDUwG2ANuAc_A8kDygHxAP2AgeBBgCDYEKyEB4ABYAFAAXABVAC4AGIAN4AegBHADvAH-ARQAlIBQQCrgFzAMUAbQA6kCmgKbAWKAtEBcAC5AGTgM5AaqA8cCFAELSUCEABAACwAKAAcAB4AEQAJgAVQAuABigEMARIAjgBRgDZAHeAPwAq4BigDqAIdAReAkQBR4CxQFsALzAZOAywBnIDWAG3gPaAgeSAHgAXAHcAQAAqACPQEigJWATaApMBiwDcgHlAP3AgiBBgpA3AAXABQAFQAOAAggBkAGgAPAAiABMACkAFUAMQAfoBDAESAKMAZQA0QBsgDvgH2AfoBFgCMAFBAKuAXMAvIBigDaAG4AQ6Ai8BIgCdgFDgKbAWKAtgBcAC5AF2gLzAX0Aw0BkgDJ4GWAZcAzmBrAGsgNvAbqA4IByYDxwHtAQhAhaUAQgAXABIAI4Ac4A7gCAAEiALEAa8A7YB_wEegJFATEAm0BSACnwFdgLoAXkAxYBkwDUwGvAPKAfFA_YD9wIGAQPAgmBBgCDYEKw.YAAAAAAAAAAA; OTAdditionalConsentString=1~; domain_selected=true; __cf_bm=LWPEvs.Wr9ScEQyTs6Jhn1FhMgsUVfDQ_jXGVN5uW9Y-1730639988-1.0.1.1-SxvC5B_cVFwsDri9gFEt0HZTvoW6IfDoHidel4qAZSReL.iQAzjbDgNuePa8hxYQhOXCMhaJViccrOSnx3n7RbI_qx0jbxj3ZZlWHCQUy.8; access_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzMwNjQwMDIyLCJzaWQiOiJkZjc4NGE5YzFkYWUyZDcxN2RmNDg2MmY5NTE0M2Y1OSIsInNjb3BlIjoicHVibGljIiwiZXhwIjoxNzMwNjQ3MjIyLCJwdXJwb3NlIjoiYWNjZXNzIn0.tcA5IY9XMXuSNEcyi4-u778F66vbIyIDBGuaFPFyMh1vJB0oB1NpvmVp9O4CNK-MzZgaqNzj8PSGOAh-Nqhex0-oE0yaL_NpBUjlwCmmUBWTy10QNuWSU083vkvT7zrppKZRK6PKxD6s7g-Ba3IpqaKFr2flDK7261TR86es1eEI_0iByjAFVc7dmuS2CLU-BK5i1Q6suT0qSUI_YkpY8dDe1P7AwbpN02_hkt0m69SqV83WMFlAks4HmueNN7XXdntA0dtFRKSEmNOAF8MmjwwYbfRlgo8pxFrgqu0AITssbekT5Jyo9RpfiV-f2NrSqfEkOz-HLGMWuH4zxqK9Zw; refresh_token_web=eyJraWQiOiJFNTdZZHJ1SHBsQWp1MmNObzFEb3JIM2oyN0J1NS1zX09QNVB3UGlobjVNIiwiYWxnIjoiUFMyNTYifQ.eyJhcHBfaWQiOjQsImNsaWVudF9pZCI6IndlYiIsImF1ZCI6ImZyLmNvcmUuYXBpIiwiaWF0IjoxNzMwNjQwMDIyLCJzaWQiOiJkZjc4NGE5YzFkYWUyZDcxN2RmNDg2MmY5NTE0M2Y1OSIsInNjb3BlIjoicHVibGljIiwiZXhwIjoxNzMxMjQ0ODIyLCJwdXJwb3NlIjoicmVmcmVzaCJ9.YMQbHtLiBjkVjzxGdGRWvQfAJnFRs8KZ2BIERgi_rK5TNMvRahEcZF38r9nA9jdbVbbrO21y7p3qx-DBa2zzZ3FMr52_StkQDv_Q79AEr9LhvAF2RjiHpAmbPqCj5atpfqR14eqJxwnTTX7_jvasWBUyow3ChgPfyqGSn99__1ALyTw8JzReZ8jeBp-duuUjsNz-LYdWMoH4BKN_3IA6CmU75qyMA6RXMtIXkDt9e301ShEz6ZOsuzUqekueULaE6iTx8I9wHnM0T4RiMtDFfM__h-StlkAti8JTfPcjcpESMUqxzqElgZDvRGSisJXLM16FTwSkwo-8QkaRXdlZFA; cf_clearance=m_pb_mLw_yMgNZ6Hf5BWWmZZ6kt_S4BnsnYTjdS5XZg-1730640023-1.2.1.1-lRb4QVs_4T9H76s.WrPUNlj4hYVAWA9f1Vb6UPwY_T9elGPUxti5ngKMYiY0WOYglEqmB2AaWPhIUBmILjQmluimRWOLZodGuHxf3W6jtK407e2kjTNixIOErGRz3NaaBbILNGPM0_0iwbgY_5YF0wgt2Vvr4vR5Zaq18Uysei2a2NnPFAWKJiVXWw98DVVU4RWDTfay2RdIOe_t5u5NcwvKoeCXo0l37i4MFJh3nWZRW4GXrJEuUoaqyFcT3xL5hxzMIXRWIAipYg5yJKW9tnx1mAfg.4kNIfQ_Jw_T0MNVheApkglhdFnVE4O1pTdXteYM.1PiJTmvFdZ0O9nI6ciXlaEX4YJ1h5CG2sjSeAJBKn7KRy5E7_2v3sC4W3LzfCeyIerBKVlf5BPc9CK7tt2di4nL5R3W5Hm_mwSnsodMhHpTYswzAlefaFXd0_tGve5LWN6Jrax.qdab6MYZnQ; datadome=7h~YsAWRzyQR1qoYmarED3GVkBIKI_RHrh_o0pSZPl1fYKYftvW8oxMhEaOWezgkYjEPu~8TNG~sdpQ7VB3Ub5f_ryPR8jsU~NjBX_zcRyA_r7IHciLYJqGgfLiypEtC; viewport_size=615; _dd_s=rum=0&expire=1730641315505; OptanonConsent=isGpcEnabled=0&datestamp=Sun+Nov+03+2024+14%3A26%3A55+GMT%2B0100+(heure+normale+d%E2%80%99Europe+centrale)&version=202312.1.0&browserGpcFlag=0&isIABGlobal=false&consentId=81735f50-e397-4acf-8760-2d4039a02d38&interactionCount=18&hosts=&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0%2CV2STACK42%3A0%2CC0015%3A0&AwaitingReconsent=false&geolocation=FR%3BIDF; _vinted_fr_session=aHBKUjY3TEpIdjhkcXF0dCtNK0kvekVEZVhxb0d2b2ZtWFovQzZWajlaalpydzNLMkdQVm40N1Q1cU5tRWJRQm5mcG5GeXdsUnhTRXZlK2FaT2lnZ1J0cGJ1ckpsQkVZYnp2TUFXYlQreGUrME40SzdDZ2J0emtlcit0NVZEaW1QaEwvSlFhNXdyNVQzS1RjeTVJV0hVWFRWQjJGSisvVFJYbm03RVdPN29KbExYQk9QWUZFNUl3WmNWRTRuclVUalc1TEhHNnR6ZUVteTNFbCtRM0RKTDFIN2ZOVjFxT0VVbm1qNUkwWGFuaVdqTTRZNitKbWFKTS9GWGx3aFdsK1pUZzRxTVJuTUlWM2dObSsrbjB5SWIvb3BRRmppalFlU2tvSk5pLzVOV0RlOHZSOWhzMjd2QzZOdEhSMlp0VU94TzFhNVduR1NzWVBMK2VkcitxOVFoTlg2cVdsLytEY2JQMVIreDUwUHdIZ29SZVI0ai9Ja0xCb2pUUUxkcDFaU0d2NVh1eHBSM0lzc1ZrTXM4UDNUbzlzeGNIcUFYcldTUDZIZ2daS2JKVVMzemt2NGxMSHlwMW1Hd0hxTUM5bmhROUZjSWlMWHptUFpOekhKMmp6NmJRUjdsQUhKSWM1Y2ZjTjQ2QjNPWkdOOGFnaVBnOS9lUGtrRDdiL014TFVCOGV4Tkc3eGJWOVRHODVKelRLTmZqLzRBLytROHpNSWVETHBQNW1EU3RiRkdpazBnN2JmdHdVZmxPa3UzS2tLd0JDMUNubnZoTnJ1V25yRW5qNTc3QWpPWTN0MW9nd21hSGxIMThtbTY4Y0w2SFlIQ3o5c01QTDZnSWtxQitmUEZsdmkvbEFxR0pZaU5vTGtCWkpPV0tzVVh4eGgyVzd2RHZRT3lOUkU3M1RGTjNtQ1ZWV1EydnpZVFBFbTEvdUNXRDA0TjF5allXcUZEY001eVRlazZZNnd0VHhUdVFHSWVJdFZ4RmNnS0VGNmI1SUYzRDRUVnM4L1V4cUNjY09kMk53MzArNG1XcWxiQUpVM0FrQmdYRVFjQ0NUTlNOcnQ5a1Z3dlE5M3o0UFg5UC9tUTlITjhQZnV4ZitZVEQyL3Nkemc4K3g5OVhGMVdRR0NickU1TERmZ3NlMnBzdDBXY2FyYlpjWnI4dUxiZlhuMlNjRHVWSEpCcnlGNEE1VzQ1Rkk2RmJ3bWZCaWNMbnVEckFEUmFkMk9KYnJCVHB3UFRGaEtwLzFtNEY5YVUya0VDMHBhR3JkRW83S2ZmU3NFbXUwV0ZSVXFrY21VWHJsaDdxMkdqTWg5c2lGbDdYOGxhWjJXQ2xLWVBVYW9QWGl6bTl5QmJ1WUFlVEJzMFcvdjJ2MVI1dHpNemtYRmNKZ3F0LzByNWNUT3RJZ3ZPNTgzRG9ZdFZFZ2k1VkZEVDMyRWZOM1pMTXRzTi9mMHprL0VURVRmd3ZtaHRGZXY1L1FJWkVwSm43eEQ4Nm50Qkk3TGx2Qi9TbDFMU0E1ajBkM05YKzMzZ09rWkxiSUFkd243aHF6cnlVZUZyeTY1UEpWZTBhRWN1UGdOWmwyTkVqQ2V5RnEwcVozMmV0ZDNtbkZLMytXT01PYnYvL2haNXZwdGd1cHhnL2RrZEpqbHVCa1VkaU45QU9DazJ4VTltUlZkVzVpTk9ibTVacEp5V0o3QkhHbnZxR0xjV1VRS2VKbFg3REJMencrd3ZhVjFYa3M4Yi9nR3FJK1AvZGUvQlEzQ1d3Vyt4Wmh1a0M3MzFlcFRvMW9uNUhGSDZZZHdMWGJKekpjeUIvOCs2S2lJbnl6M0xpL05yQVB1QnJpak5RNkNJSEFLb2ZDSExqS0Rtb0dCMFFVbnFJQWR3YUgzS0drR3R3UTd6TUd1VGx3eHhjQXViU002NW4yTWxEV2h5UXJGRUJLRTUxVTc3dmFVdCtkeGRUd2pqSGJNVnRaejRZZ251OUI3UFNTTFhXS3BNejZIbUYvelRBaEJQSWdvbFV2dyt1Uk5TQjBtV0RDLzJUd0RZSWNXT3R4TThqcU5zdFEvdzlsQUF2UnJSRmhBUDBhMnF1ZWVzRTk2UTkzYkdFYnBoVlg0UlJGOWx0UXpEUXpOYS8vOWs5aWV0Q053RDBZVkxnREJwdmZHNUpOUDkvRkl1QlRRTGMxVnBsSlZOVVl5KzN3OC9QU1daYm5hM05RSUJSNk55M0RpNHZxY1pHNCtJZ28yK0JZRDM0SHEwZ3VJaEw5YmJjNGF5UFBnUDJxTVZGYUFHQVNpNGZKcDg0dTUzN2E4RmxDVVJ1ZHI4a04rUTRJMVpqM3Z6cE1nWXc5Z1U3Vk5OVEdkSEh2Q2duRjBNamZYRXd4aDI3OW5TbG45K3dYY2haSklNV1ZSN3JWbGt4dUFRWUg5d2ZsZ0UzOW1hR05RalFGSnY3ejE2Zm5YcDlMaHVLdG9sK04rc1dZalZBVFRVRkRWTWlLZldERVlSK3JqTWplZlA3QnhXOHE0N25TOVp4VnVkK3lINzZQcmZ3dmE2Uy9seitxQmQxR0NLdkdudDQrQVpTWnJYYzM1RWNaYjNVL0N5UXQ4SU5IRzdHUmdoQT09LS0zM29mT1ZVNDZ3Y0g4SlBJV1FoWkd3PT0%3D--d382879046b965b23cb975ebc4366a0e01dca346; banners_ui_state=PENDING",
      },
    });

    if (response.ok) {
      //const body = await response.text();
      const data = await response.json();
      //const jsonData = await parse(body); // Ajouter 'await' ici pour attendre le résultat
      const jsonData = await parse(data, id);

      // Enregistrer les données dans un fichier JSON
      fs.writeFileSync(
        "deals/deals-vinted.json",
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
      console.log("Données stockées dans deals-vinted.json\n");

      return jsonData;
    } else {
      console.error(
        `Erreur de réponse : statut ${response.status} - ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la requête fetch :", error);
  }

  return null;
};

async function extractCsrfToken() {
  const response = await fetch("https://www.vinted.fr/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
    },
  });
  const text = await response.text();
  const csrfTokenMatch = text.match(/"CSRF_TOKEN":"([^"]+)"/);
  console.log("csfr : ", csrfTokenMatch[1]);
  return csrfTokenMatch ? csrfTokenMatch[1] : null;
}
