import asyncio
import aiohttp
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import pyglet

song = pyglet.media.load("C:\Users\danil\Downloads\helicopter-helicopter.mp3")
cur_time = time.time()

async def fetch_data(session, url, headers):
    async with session.get(url, headers=headers) as response:
        return await response.text()

async def get_data():
    k = 0
    url = "https://biggeek.ru/catalog/aksessuary"
    HEADERS = {"User-Agent": UserAgent().random}

    async with aiohttp.ClientSession() as session:
        html = await fetch_data(session, url, HEADERS)
        soup = BeautifulSoup(html, "lxml")
        pagescount = int(soup.find("div", class_="prod-pagination").find_all("a", class_="prod-paginationitem")[-1].text)

        for i in range(1, pagescount + 1):
            url = f"https://biggeek.ru/catalog/aksessuary?page={i}"
            html = await fetch_data(session, url, HEADERS)
            soup = BeautifulSoup(html, "lxml")

            items = soup.find("div", class_="catalog-contentprods-list").find_all("div", class_="catalog-card")

            for j in items:
                try:
                    name = j.find("a", class_="catalog-card__title cart-modal-title").text.strip()
                except:
                    name = "Нет такого названия"

                try:
                    price = j.find('b', class_="cart-modal-count").text.strip()
                except:
                    price = "Нет такой цены"

                O = []
                O = name
                H = []
                H = price

                if (
                    (O.count("для робота-пылесоса") == 0 and O.count("Рюкзак") == 0 and O.count("Комплект сменных") == 0
                    and O.count("Сменный фильтр") == 0 and O.count("Одноразовая тряпка") == 0 and O.count("Экосумка") == 0
                    and O.count("Магнитная открывалка") == 0 and O.count("Сменная тряпка") == 0 and O.count("Шлейка для собак") == 0
                    and O.count("Сменные насадки") == 0 and O.count("Сменные") == 0 and O.count("чехол") == 0 and O.count("наклейка") == 0
                    and O.count("Набор адаптеров") == 0 and O.count("Сменные фильтры") == 0 and O.count("Силиконовый чехол-бумажник") == 0
                    and O.count("Сменный") == 0 and O.count("Защитное стекло") == 0 and O.count("Кабельный органайзер") == 0 and
                    O.count("батарейка") == 0 and O.count("Плоский аудиокабель") == 0 and O.count("Кабель с") == 0
                    and O.count("спортивный ремешок") == 0 and O.count("Пластиковый чехол-накладка") == 0) and H == '100 ₽'
                ):
                    song.play()
                    print(name + "\n" + price)
                    print(i)
                    k = 1
                    break
            if k == 1:
                break

    print(time.time() - cur_time)

def main():
    asyncio.run(get_data())

if __name__ == "__main__":
    while True:
        main()