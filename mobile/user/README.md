# AntAPP Mobile User

Expo Router tabanli mobil user istemcisi.

## Calistirma

```bash
cd mobile/user
npm install
npx expo start
```

## Ortam Degiskeni

`.env.local` dosyasina asagidaki degeri ekleyin:

```bash
EXPO_PUBLIC_API_URL=http://<local-ip>:5000/api
```

Fiziksel cihazda backend'e erisebilmek icin `<local-ip>` olarak kendi makine IP'nizi kullanin.

## Demo Giris (Development Seed)

- User: `user@antapp.local`
- Password: `123Pa$$word!`

Mobile client sadece `User` rolu ile giris kabul eder.
