const initialState = {
	repairType: [
		{
			id: 1,
			name: 'Косметический'
		},
		{
			id: 2,
			name: 'Современный'
		},
		{
			id: 3,
			name: 'Черновая отделка'
		},
		{
			id: 4,
			name: 'Предчистовая отделка'
		}
	],
	district: [
		{
			id: 1,
			name: 'Гидронамыв'
		},
		{
			id: 2,
			name: 'Нагорный'
		},
		{
			id: 3,
			name: 'ОМК'
		},
		{
			id: 4,
			name: 'Самарово'
		},
		{
			id: 5,
			name: 'Центральный'
		},
		{
			id: 6,
			name: 'Югорская звезда'
		},
		{
			id: 7,
			name: 'СУ967'
		},
		{
			id: 8,
			name: 'Учхоз'
		}
	],
	banks: [
		{
			id: 1,
			name: 'ВТБ'
		},
		{
			id: 2,
			name: 'Сбербанк'
		},
		{
			id: 3,
			name: 'Открытие'
		},
		{
			id: 4,
			name: 'Россельхоз'
		},
		{
			id: 5,
			name: 'Запсибкомбанк'
		},
		{
			id: 6,
			name: 'ДельтаКредит'
		},
		{
			id: 7,
			name: 'Наличные'
		}
	],
	agency: [
		{
			id: 1,
			name: 'АН Вариант'
		},
		{
			id: 2,
			name: 'АН Этажи'
		},
		{
			id: 3,
			name: 'АН Новый адрес'
		},
		{
			id: 4,
			name: 'АН Мегаполис-снрвис'
		},
		{
			id: 5,
			name: 'АН Сити-Риэлт'
		},
		{
			id: 6,
			name: 'ООО Ипотечное агентство Югры'
		},
		{
			id: 7,
			name: 'АН Юанит'
		},
		{
			id: 8,
			name: 'АН Эксперт'
		},
		{
			id: 9,
			name: 'АН Фортуна'
		},
		{
			id: 10,
			name: 'АН Собственник'
		},
		{
			id: 11,
			name: 'АН Сатурн'
		},
		{
			id: 12,
			name: 'АН Росса'
		},
		{
			id: 13,
			name: 'АН Недвижимость Югры'
		},
		{
			id: 14,
			name: 'АН Кибалион'
		},
		{
			id: 15,
			name: 'Частный риэлтор'
		}
	],
	specialize: [
		{
			id: 1,
			name: 'Продажа недвижимости'
		}
	],
	propertyType: [
		{
			id: 1,
			name: 'Квартира'
		},
		{
			id: 2,
			name: 'Коммерция'
		}
	]
}

export default (state = initialState, action) => {
  switch (action.type) {
    default:
      return state
  }
}