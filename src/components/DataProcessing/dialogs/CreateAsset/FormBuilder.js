import React from "react"
import {
  TextField,
  Button,
  Chip,
  Box,
  Stack,
  IconButton
} from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add } from "@mui/icons-material"
import dayjs from "dayjs"

export default function FormBuilder({ fields, onSubmit }) {
  // 1. Generează schema Zod
  const zodShape = {}
  fields.forEach((field) => {
    if (field.type === "string") {
      zodShape[field.name] = z.string().min(1, `${field.label} is required`)
    } else if (field.type === "keywords") {
      zodShape[field.name] = z.array(z.string().min(1)).min(1, `At least one ${field.label}`)
    } else if (field.type === "date") {
      zodShape[field.name] = z.date({ required_error: `${field.label} is required` })
    }
  })

  const schema = z.object(zodShape)

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: fields.reduce((acc, f) => {
      acc[f.name] = f.type === "keywords" ? [] : f.type === "date" ? null : ""
      return acc
    }, {})
  })

  const keywordInputs = React.useRef({}) // pentru a stoca keyword inputuri per field

  const addKeyword = (name) => {
    const currentInput = keywordInputs.current[name]?.trim()
    const currentValues = watch(name)
    if (currentInput && !currentValues.includes(currentInput)) {
      setValue(name, [...currentValues, currentInput])
      keywordInputs.current[name] = ""
    }
  }

  const removeKeyword = (name, kw) => {
    setValue(name, watch(name).filter((k) => k !== kw))
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Stack spacing={3}>
        {fields.map((field) => {
          if (field.type === "string") {
            return (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: rhfField }) => (
                  <TextField
                    {...rhfField}
                    label={field.label}
                    error={!!errors[field.name]}
                    helperText={errors[field.name]?.message}
                    fullWidth
                  />
                )}
              />
            )
          }

          if (field.type === "keywords") {
            const kwName = field.name
            const keywords = watch(kwName)
            return (
              <Box key={kwName}>
                <Stack direction="row" spacing={1}>
                  <TextField
                    label={`Add ${field.label}`}
                    value={keywordInputs.current[kwName] || ""}
                    onChange={(e) => {
                      keywordInputs.current[kwName] = e.target.value
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addKeyword(kwName)
                      }
                    }}
                    fullWidth
                  />
                  <IconButton onClick={() => addKeyword(kwName)}>
                    <Add />
                  </IconButton>
                </Stack>
                <Box mt={1} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {keywords.map((kw) => (
                    <Chip key={kw} label={kw} onDelete={() => removeKeyword(kwName, kw)} />
                  ))}
                </Box>
                {errors[kwName] && (
                  <Box sx={{ color: "red", fontSize: "0.875rem", mt: 1 }}>
                    {errors[kwName]?.message}
                  </Box>
                )}
              </Box>
            )
          }

          if (field.type === "date") {
            return (
              <Controller
                key={field.name}
                name={field.name}
                control={control}
                render={({ field: rhfField }) => (
                  <DatePicker
                    label={field.label}
                    value={rhfField.value ? dayjs(rhfField.value) : null}
                    onChange={(date) =>
                      rhfField.onChange(date ? date.toDate() : null)
                    }
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors[field.name],
                        helperText: errors[field.name]?.message
                      }
                    }}
                  />
                )}
              />
            )
          }

          return null
        })}

        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </Stack>
    </Box>
  )
}
