import { Button, Checkbox, Divider, Select, Textarea, TextInput } from '@mantine/core';
import React, { useState } from 'react';
import 'dayjs/locale/tr';


const ProjectCreate = () => {
  const [hasEkYapi, setHasEkYapi] = useState(false);

  return (
    <div className="py-6 px-6">
      <h2 className="text-2xl font-bold  mb-6 text-ivosis-700">Proje Ekle</h2>
      <div className="border rounded-lg p-6 bg-white space-y-8 ">

        {/* GENEL BİLGİLER */}
        <div>
          <h6 className="text-lg font-bold text-ivosis-700 mb-4">Genel Bilgiler</h6>
          <div className="w-full md:w-1/2 space-y-6">

            {/* Proje Adı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Proje Adı <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Açıklama
              </label>
              <Textarea placeholder="Açıklama yazın" rows={4} className="w-full" />
            </div>

            {/* Tarihler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Başlangıç Tarihi <span className="text-red-500">*</span>
                </label>
                <input type="date" className="border rounded-md px-3 py-2 w-full" />
              </div>

              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input type="date" className="border rounded-md px-3 py-2 w-full" />
              </div>
            </div>

            {/* Şehir - Durum - Önem */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Şehir <span className="text-red-500">*</span>
                </label>
                <Select placeholder="Şehir Seçin" searchable clearable className="w-full" />
              </div>

              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Durum <span className="text-red-500">*</span>
                </label>
                <Select placeholder="Durum Seçin" searchable clearable className="w-full" />
              </div>

              <div>
                <label className="text-natural-800 font-semibold block mb-1">
                  Önem <span className="text-red-500">*</span>
                </label>
                <Select placeholder="Önem Seçin" searchable clearable className="w-full" />
              </div>
            </div>

          </div>
        </div>

        <Divider />

        {/* TEKNİK BİLGİLER */}
        <div className="w-full md:w-1/2 space-y-6">
          <h6 className="text-lg font-bold text-ivosis-700 mb-6">Teknik Bilgiler</h6>

          {/* Satır 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Panel Sayısı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Sayısı <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>

            {/* Panel Gücü */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Gücü <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>

            {/* Panel Markası */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                Panel Markası <span className="text-red-500">*</span>
              </label>
              <Select placeholder="Marka Seçin" searchable clearable className="w-full" />
            </div>

            {/* DC (kWp) */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                DC (kWp) <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>
          </div>

          {/* Satır 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* İnvertör Sayısı */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Sayısı <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>

            {/* İnvertör Gücü */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Gücü <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>

            {/* İnvertör Markası */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                İnvertör Markası <span className="text-red-500">*</span>
              </label>
              <Select placeholder="Marka Seçin" searchable clearable className="w-full" />
            </div>

            {/* AC (kWe) */}
            <div>
              <label className="text-natural-800 font-semibold block mb-1">
                AC (kWe) <span className="text-red-500">*</span>
              </label>
              <TextInput className="w-full" />
            </div>
          </div>
        </div>


        <Divider />

        {/* EK YAPI BİLGİLERİ */}
        <div className="w-full md:w-1/2 space-y-6">
      <h6 className="text-lg font-bold text-ivosis-700 mb-4">Ek Yapı Bilgileri</h6>

      {/* Checkbox */}
      <div className="mb-6">
        <Checkbox
          label="Ek Yapı mı?"
          className="font-semibold"
          checked={hasEkYapi}
          onChange={(event) => setHasEkYapi(event.currentTarget.checked)}
        />
      </div>

      {/* Grid alanlar sadece checkbox işaretliyse görünsün */}
      {hasEkYapi && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel Sayısı */}
          <div>
            <label className="text-natural-800 font-semibold block mb-1">
              Panel Sayısı <span className="text-red-500">*</span>
            </label>
            <TextInput className="w-full" />
          </div>

          {/* İnvertör Sayısı */}
          <div>
            <label className="text-natural-800 font-semibold block mb-1">
              İnvertör Sayısı <span className="text-red-500">*</span>
            </label>
            <TextInput className="w-full" />
          </div>
        </div>
      )}
      </div>


        {/* SUBMIT BUTTON */}
        <div className="-full md:w-1/2 space-y-6 text-center">
          <Button className="bg-green-500 hover:!bg-green-500">Projeyi Kaydet</Button>
        </div>
      </div>

    </div> //ana div
  );
};

export default ProjectCreate;
